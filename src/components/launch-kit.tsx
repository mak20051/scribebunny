import { CircleCheck, Circle, Rocket, Star } from "lucide-react";
import Link from "next/link";
import {
  submitReviewAction,
  toggleLaunchStepAction,
} from "@/app/portal/actions";
import { LocalTime } from "@/components/local-time";
import { SubmitButton } from "@/components/submit-button";
import { LAUNCH_STEPS } from "@/lib/launch";
import type { PortalOrder, Role } from "@/lib/portal";

type Props = {
  order: PortalOrder;
  role: Role;
  orderRef: string;
  k: string;
};

function Hidden({ orderRef, k }: { orderRef: string; k: string }) {
  return (
    <>
      <input type="hidden" name="ref" value={orderRef} />
      <input type="hidden" name="k" value={k} />
    </>
  );
}

const card = "rounded-[1.75rem] border-4 border-gray-800 p-5 sm:p-6";

/** After delivery: launch checklist, review, and the next order. */
export function LaunchKit({ order, role, orderRef, k }: Props) {
  const isClient = role === "client";
  const done = new Set(order.launch?.done ?? []);
  const review = order.review;

  return (
    <section id="launch" className="mt-12 scroll-mt-28">
      <h2 className="font-display flex items-center gap-3 text-3xl font-bold text-gray-800">
        <Rocket className="h-8 w-8 text-[#FF3333]" aria-hidden="true" />
        Launch your video
      </h2>
      <p className="mt-2 max-w-2xl text-lg text-gray-700">
        {isClient
          ? "Your video is ready to work for you. Six quick steps to get it seen and turn views into customers."
          : "What the client sees once a video is complete. The ticks are theirs."}
      </p>
      <p className="mt-2 text-base font-bold text-gray-800">
        {done.size} of {LAUNCH_STEPS.length} done
      </p>

      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {LAUNCH_STEPS.map((step, index) => {
          const ticked = done.has(step.id);
          const Icon = ticked ? CircleCheck : Circle;
          return (
            <li
              key={step.id}
              className={`${card} ${ticked ? "bg-[#FFF9E0]" : "bg-white"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold text-gray-800">
                  <span className="mr-2 text-[#FF3333]">{index + 1}.</span>
                  {step.title}
                </h3>
                {isClient ? null : (
                  <Icon
                    className={`h-6 w-6 shrink-0 ${ticked ? "text-green-600" : "text-gray-300"}`}
                    aria-label={ticked ? "Done" : "Not done yet"}
                  />
                )}
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-base text-gray-700">
                {step.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
              {isClient ? (
                <form action={toggleLaunchStepAction} className="mt-4">
                  <Hidden orderRef={orderRef} k={k} />
                  <input type="hidden" name="step" value={step.id} />
                  <SubmitButton
                    pendingLabel="Saving…"
                    className={`${ticked ? "btn-primary" : "btn-secondary"} inline-flex items-center gap-2`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {ticked ? "Done" : "Mark as done"}
                  </SubmitButton>
                </form>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div id="review" className={`${card} scroll-mt-28 bg-white`}>
          <h3 className="font-display text-2xl font-bold text-gray-800">
            {isClient ? "How did we do?" : "Client review"}
          </h3>
          {review ? (
            <figure className="mt-4">
              <p
                className="flex gap-1"
                aria-label={`${review.rating} of 5 stars`}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={`h-6 w-6 ${value <= review.rating ? "fill-[#FFE66D] text-gray-800" : "text-gray-300"}`}
                    aria-hidden="true"
                  />
                ))}
              </p>
              <blockquote className="mt-3 text-lg whitespace-pre-wrap text-gray-800">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-2 text-base text-gray-600">
                {[review.name, review.role, review.company]
                  .filter(Boolean)
                  .join(", ")}{" "}
                · <LocalTime iso={review.at} />
              </figcaption>
              <p className="mt-2 text-sm text-gray-600">
                {review.canFeature
                  ? "OK to feature on scribebunny.com"
                  : "Private: not for the website"}
              </p>
            </figure>
          ) : (
            <p className="mt-2 text-base text-gray-700">
              {isClient
                ? "A short review helps other teams find a small studio like ours, and we read every one."
                : "No review yet. The day 7 and day 30 emails ask for one."}
            </p>
          )}
          {isClient ? (
            <details className="mt-4" open={!review}>
              <summary className="cursor-pointer font-bold text-[#FF3333]">
                {review ? "Edit your review" : "Write your review"}
              </summary>
              <ReviewForm order={order} orderRef={orderRef} k={k} />
            </details>
          ) : null}
        </div>

        <div className={`${card} bg-[#FFE66D]`}>
          <h3 className="font-display text-2xl font-bold text-gray-800">
            Ready for your next story?
          </h3>
          <p className="mt-2 text-base text-gray-800">
            Product launches, onboarding, ads, explainers: ordering takes a
            minute, and we start sketching right away.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link href="/#pricing" className="btn-primary">
              Order your next video
            </Link>
            <Link
              href="/free-concepts"
              className="text-base font-bold text-gray-800 underline"
            >
              Or get 3 free concepts first
            </Link>
          </div>
        </div>
      </div>

      {isClient ? null : <FollowUpStatus order={order} />}
    </section>
  );
}

function ReviewForm({
  order,
  orderRef,
  k,
}: {
  order: PortalOrder;
  orderRef: string;
  k: string;
}) {
  const review = order.review;
  return (
    <form action={submitReviewAction} className="mt-4 space-y-4">
      <Hidden orderRef={orderRef} k={k} />
      <fieldset>
        <legend className="text-base font-semibold text-gray-700">
          Rating
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-1 rounded-full border-2 border-gray-800 px-3 py-1 font-bold text-gray-800 has-[:checked]:bg-[#FFE66D] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#FF3333]"
            >
              <input
                type="radio"
                name="rating"
                value={value}
                required
                defaultChecked={review ? review.rating === value : value === 5}
                className="sr-only"
              />
              {value}
              <Star className="h-4 w-4 fill-current" aria-hidden="true" />
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-base font-semibold text-gray-700">
        Your review
        <textarea
          name="quote"
          required
          rows={4}
          maxLength={1200}
          defaultValue={review?.quote}
          placeholder="What was it like working with us, and what has the video done for you?"
          className="form-input mt-1"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-base font-semibold text-gray-700">
          Your name
          <input
            name="name"
            required
            maxLength={120}
            defaultValue={review?.name ?? order.client.name}
            className="form-input mt-1"
          />
        </label>
        <label className="block text-base font-semibold text-gray-700">
          Role (optional)
          <input
            name="role"
            maxLength={120}
            defaultValue={review?.role}
            placeholder="Head of Marketing"
            className="form-input mt-1"
          />
        </label>
      </div>
      <label className="block text-base font-semibold text-gray-700">
        Company (optional)
        <input
          name="company"
          maxLength={120}
          defaultValue={review?.company}
          className="form-input mt-1"
        />
      </label>
      <label className="flex items-start gap-3 text-base text-gray-700">
        <input
          type="checkbox"
          name="canFeature"
          defaultChecked={review?.canFeature ?? false}
          className="mt-1 h-5 w-5 accent-[#FF3333]"
        />
        Scribebunny may feature this review, with my name, role and company, on
        its website.
      </label>
      <SubmitButton
        pendingLabel="Sending…"
        className="btn-primary w-full sm:w-auto"
      >
        {review ? "Update review" : "Send review"}
      </SubmitButton>
    </form>
  );
}

function FollowUpStatus({ order }: { order: PortalOrder }) {
  if (!order.completedAt) {
    return (
      <p className="mt-6 text-base text-gray-600">
        Follow-up emails start when you mark the project complete: day 7
        (checklist and review request) and day 30 (results and the next order).
      </p>
    );
  }
  const start = Date.parse(order.completedAt);
  const row = (label: string, days: number, sentAt?: string) => (
    <li>
      {label}:{" "}
      {sentAt ? (
        <>
          sent <LocalTime iso={sentAt} />
        </>
      ) : (
        <>
          due{" "}
          <LocalTime iso={new Date(start + days * 86_400_000).toISOString()} />
        </>
      )}
    </li>
  );
  return (
    <div className="mt-6 text-base text-gray-600">
      <p className="font-bold text-gray-800">Follow-up emails</p>
      <ul className="mt-1 space-y-1">
        {row("Day 7, checklist and review", 7, order.followUps?.day7)}
        {row("Day 30, results and next order", 30, order.followUps?.day30)}
      </ul>
    </div>
  );
}
