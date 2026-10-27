import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { SubmitButton } from "@/components/submit-button";
import { stopLinkState } from "@/lib/prospect-follow-ups";
import { EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Stop Reminders | Scribebunny",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ id?: string; k?: string; result?: string }>;
};

/**
 * The "Stop these reminders" link in follow-up emails. Opening the link
 * changes nothing (mail scanners open every link); the button does.
 */
export default async function StopRemindersPage({ searchParams }: Props) {
  const { id = "", k = "", result } = await searchParams;
  const state =
    result === "stopped" || result === "unknown"
      ? result
      : await stopLinkState(id, k);

  const copy = {
    active: {
      badge: "Reminders",
      title: "Stop our reminders?",
      text: `We'll stop the follow-up emails about your ${id.startsWith("C-") ? "free video concepts" : "quote"}. If you write to us, we'll still reply.`,
    },
    stopped: {
      badge: "Done",
      title: "No more reminders",
      text: "You won't get any more follow-up emails about this from us. If you change your mind, just reply to one of our emails.",
    },
    unknown: {
      badge: "Hmm",
      title: "We couldn't find these reminders",
      text: `The link may be incomplete. Reply to any of our emails, or write to ${EMAIL}, and we'll stop them by hand.`,
    },
  }[state];

  return (
    <SiteShell>
      <main className="relative overflow-x-hidden bg-[linear-gradient(135deg,#FFF5F5_0%,#FFFFFF_50%,#FFF9F0_100%)] px-6 pt-32 pb-24 text-slate-800 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-4 inline-block rotate-[-2deg] rounded-full border-2 border-gray-800 bg-[#FFE66D] px-4 py-2 text-base font-bold">
            {copy.badge}
          </span>
          <h1 className="font-display text-5xl font-bold text-gray-800 md:text-6xl">
            {copy.title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-xl leading-relaxed text-gray-700">
            {copy.text}
          </p>
          {state === "active" ? (
            <form
              method="post"
              action="/api/follow-ups/stop"
              className="mt-10 flex justify-center"
            >
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="k" value={k} />
              <input type="hidden" name="confirm" value="1" />
              <SubmitButton
                pendingLabel="Stopping…"
                className="btn-primary text-lg"
              >
                Stop reminders
              </SubmitButton>
            </form>
          ) : (
            <p className="mt-10">
              <Link href="/" className="btn-secondary text-lg">
                Back to homepage
              </Link>
            </p>
          )}
        </div>
      </main>
    </SiteShell>
  );
}
