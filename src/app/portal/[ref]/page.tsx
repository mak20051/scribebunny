import type { Metadata } from "next";
import {
  ExternalLink,
  FileText,
  MessageCircle,
  Paperclip,
  Play,
} from "lucide-react";
import Link from "next/link";
import {
  markPaidAction,
  payPortalAction,
  replaceClientLinkAction,
  resetDemoAction,
  setOrderStatusAction,
  stopPayRemindersAction,
  updateVideoAction,
} from "@/app/portal/actions";
import { AutoRefresh } from "@/components/auto-refresh";
import { FollowUpStatus } from "@/components/follow-up-status";
import { LaunchKit } from "@/components/launch-kit";
import { LocalTime } from "@/components/local-time";
import { MessageComposer } from "@/components/message-composer";
import { PortalShell } from "@/components/portal-shell";
import { SubmitButton } from "@/components/submit-button";
import {
  clientLink,
  clientPath,
  isPaid,
  openOrder,
  type PortalOrder,
  VIDEO_STATUSES,
  type PortalVideo,
} from "@/lib/portal";
import { followUpSchedule } from "@/lib/prospect-follow-ups";
import { EMAIL, PARENT_COMPANY } from "@/lib/site";
import { storeConfigured } from "@/lib/store";
import {
  formatBytes,
  INLINE_TYPES,
  isPreviewImage,
  type Attachment,
} from "@/lib/attachments";

export const metadata: Metadata = {
  title: "Project Portal | Scribebunny",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ k?: string; created?: string; paid?: string }>;
};

const STATUS_STYLE: Record<PortalVideo["status"], string> = {
  "Waiting for brief": "bg-gray-100 text-gray-700",
  "Script & storyboard": "bg-[#FFE66D] text-gray-800",
  Animating: "bg-[#4ECDC4] text-gray-800",
  "Ready for review": "bg-[#FF6B6B] text-white",
  Complete: "bg-green-600 text-white",
};

/** Screenshots as thumbnails; other files as download chips. */
function MessageFiles({
  files,
  href,
}: {
  files: Attachment[];
  href: (file: Attachment, download?: boolean) => string;
}) {
  const images = files.filter((file) => isPreviewImage(file.contentType));
  const others = files.filter((file) => !isPreviewImage(file.contentType));
  return (
    <div className="mt-3 space-y-2">
      {images.length ? (
        <div className="flex flex-wrap gap-2">
          {images.map((file) => (
            <a
              key={file.path}
              href={href(file)}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-xl border-2 border-gray-800 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- private files, served by the portal */}
              <img
                src={href(file)}
                alt={file.name}
                loading="lazy"
                className="h-32 w-auto max-w-[14rem] object-cover"
              />
            </a>
          ))}
        </div>
      ) : null}
      {others.map((file) => {
        const opens = INLINE_TYPES.includes(file.contentType);
        const Icon = opens ? FileText : Paperclip;
        return (
          <a
            key={file.path}
            href={href(file, !opens)}
            {...(opens ? { target: "_blank", rel: "noreferrer" } : {})}
            className="flex max-w-full items-center gap-2 rounded-xl border-2 border-gray-800 bg-white px-3 py-2 text-base font-semibold text-gray-800 hover:bg-gray-50"
          >
            <Icon
              className="h-5 w-5 shrink-0 text-[#FF3333]"
              aria-hidden="true"
            />
            <span className="truncate">{file.name}</span>
            <span className="shrink-0 text-sm font-normal text-gray-600">
              {formatBytes(file.size)}
            </span>
          </a>
        );
      })}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="mb-6 rounded-2xl border-2 border-gray-800 bg-[#FFF9E0] px-5 py-4 text-base text-gray-800"
    >
      {children}
    </p>
  );
}

/** Custom-price portals before payment: the client's Pay button, or the team's view of it. */
function PaymentCard({
  order,
  isTeam,
  orderRef,
  k,
}: {
  order: PortalOrder;
  isTeam: boolean;
  orderRef: string;
  k: string;
}) {
  const videos = order.videos.length;
  return (
    <section className="mb-8 rounded-[1.75rem] border-4 border-gray-800 bg-[#FFE66D] p-5 sm:p-8">
      <h2 className="font-display text-3xl font-bold text-gray-800">
        {isTeam ? `Awaiting payment: ${order.amount}` : "Ready when you are"}
      </h2>
      <p className="mt-2 max-w-2xl text-lg text-gray-800">
        {isTeam
          ? "The client pays with the Pay button in their portal. If they paid another way, mark it paid here; they get a confirmation email either way."
          : `${order.packageName}: ${videos} ${videos === 1 ? "video" : "videos"} for ${order.amount}. Pay securely with Stripe, and your invoice comes from ${PARENT_COMPANY}.`}
      </p>
      <form action={isTeam ? markPaidAction : payPortalAction} className="mt-5">
        <Hidden orderRef={orderRef} k={k} />
        <SubmitButton
          pendingLabel={isTeam ? "Saving…" : "Opening Stripe…"}
          className={`${isTeam ? "btn-secondary" : "btn-primary"} inline-flex w-full items-center justify-center gap-2 sm:w-auto`}
        >
          {isTeam ? "Mark as paid" : `Pay ${order.amount} securely`}
        </SubmitButton>
      </form>
      {isTeam && order.manual && !order.demo ? (
        <FollowUpStatus
          title="Payment reminders"
          rows={followUpSchedule(order.createdAt, order.payReminders)}
          stopped={order.payReminders?.stopped}
          action={stopPayRemindersAction}
          hidden={<Hidden orderRef={orderRef} k={k} />}
          className="mt-6"
        />
      ) : null}
    </section>
  );
}

function Hidden({ orderRef, k }: { orderRef: string; k: string }) {
  return (
    <>
      <input type="hidden" name="ref" value={orderRef} />
      <input type="hidden" name="k" value={k} />
    </>
  );
}

export default async function PortalOrderPage({ params, searchParams }: Props) {
  const { ref } = await params;
  const { k = "", created, paid } = await searchParams;
  const opened = await openOrder(ref, k);

  if (!opened) {
    return (
      <PortalShell label="Client portal">
        <div className="mx-auto max-w-xl rounded-[1.75rem] border-4 border-gray-800 bg-white p-10 text-center shadow-[10px_10px_0_#FFE66D]">
          <h1 className="font-display text-4xl font-bold text-gray-800">
            We can&apos;t open this portal
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            The link may be incomplete. Open the portal link from your order
            email, or write to{" "}
            <a href={`mailto:${EMAIL}`} className="font-bold text-[#FF3333]">
              {EMAIL}
            </a>{" "}
            and we&apos;ll send it again.
          </p>
        </div>
      </PortalShell>
    );
  }

  const { order, role } = opened;
  const { messages } = order;
  const isTeam = role === "team";
  const completed = order.videos.filter(
    (video) => video.status === "Complete",
  ).length;
  const firstName = order.client.name.split(" ")[0] || "there";
  // Once a video is complete the launch kit appears: first on a finished
  // project, after the videos while others are still in progress.
  const launchKit = (
    <LaunchKit order={order} role={role} orderRef={ref} k={k} />
  );
  const launchFirst = order.status === "complete";
  const launchReady = completed > 0;

  return (
    <PortalShell label={isTeam ? "Studio view" : "Client portal"}>
      <AutoRefresh />
      {isTeam && created ? (
        <Notice>
          <strong>Portal created.</strong>{" "}
          {created === "emailed"
            ? "We emailed the client their private link."
            : "Copy the client's private link below and send it to them."}
        </Notice>
      ) : null}
      {!isTeam && paid && isPaid(order) ? (
        <Notice>
          <strong>Payment received. Thank you!</strong> Your receipt and invoice
          arrive by email from Stripe. Next, send us your brief below.
        </Notice>
      ) : null}
      {isPaid(order) ? null : (
        <PaymentCard order={order} isTeam={isTeam} orderRef={ref} k={k} />
      )}
      {order.demo ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-gray-800 bg-[#FFF9E0] px-5 py-4">
          <p className="text-base text-gray-800">
            <strong>Demo project.</strong> Sample data: send messages and update
            videos freely. Nothing here emails anyone.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {isTeam ? (
              <Link
                href={clientPath(order)}
                className="text-base font-bold text-[#FF3333] underline"
              >
                See the client view
              </Link>
            ) : null}
            <form action={resetDemoAction}>
              <SubmitButton pendingLabel="Resetting…" className="btn-secondary">
                Reset demo
              </SubmitButton>
            </form>
          </div>
        </div>
      ) : null}
      <section className="rounded-[1.75rem] border-4 border-gray-800 bg-white p-5 shadow-[6px_6px_0_#FFE66D] sm:p-8 sm:shadow-[10px_10px_0_#FFE66D]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-widest text-[#FF3333] uppercase">
              Project {order.ref}
            </p>
            <h1 className="font-display mt-2 text-3xl leading-tight font-bold text-gray-800 sm:text-4xl md:text-5xl">
              {isTeam
                ? `${order.client.name || order.client.email}'s project`
                : `Hi ${firstName}, here's your project`}
            </h1>
          </div>
          <span
            className={`rounded-full border-2 border-gray-800 px-4 py-1 text-base font-bold ${
              order.status === "complete"
                ? "bg-green-600 text-white"
                : "bg-[#FFE66D] text-gray-800"
            }`}
          >
            {order.status === "complete" ? "Complete" : "In progress"}
          </span>
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
          {[
            ["Package", order.packageName],
            [isPaid(order) ? "Amount paid" : "Price", order.amount],
            [
              "Progress",
              `${completed} of ${order.videos.length} videos complete`,
            ],
            ["Delivery", order.turnaround ?? "Planned with you"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm font-bold tracking-wide text-gray-500 uppercase">
                {label}
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-800">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {isTeam ? (
          <>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t-2 border-dashed border-gray-200 pt-6">
              <dl className="grid gap-x-8 gap-y-2 text-base text-gray-700 sm:grid-cols-2">
                <div>
                  <dt className="inline font-bold">Email: </dt>
                  <dd className="inline">
                    <a
                      href={`mailto:${order.client.email}`}
                      className="text-[#FF3333] underline"
                    >
                      {order.client.email}
                    </a>
                  </dd>
                </div>
                {order.client.phone ? (
                  <div>
                    <dt className="inline font-bold">Phone: </dt>
                    <dd className="inline">{order.client.phone}</dd>
                  </div>
                ) : null}
                {order.client.website ? (
                  <div>
                    <dt className="inline font-bold">Website: </dt>
                    <dd className="inline">{order.client.website}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="inline font-bold">Ordered: </dt>
                  <dd className="inline">
                    <LocalTime iso={order.createdAt} />
                  </dd>
                </div>
                {order.payment?.paidAt ? (
                  <div>
                    <dt className="inline font-bold">Paid: </dt>
                    <dd className="inline">
                      <LocalTime iso={order.payment.paidAt} />
                      {order.payment.method === "outside"
                        ? " (outside Stripe)"
                        : " (Stripe)"}
                    </dd>
                  </div>
                ) : null}
                {order.invoiceUrl ? (
                  <div>
                    <a
                      href={order.invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#FF3333] underline"
                    >
                      Invoice
                    </a>
                  </div>
                ) : null}
                {order.dashboardUrl ? (
                  <div>
                    <a
                      href={order.dashboardUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#FF3333] underline"
                    >
                      Stripe payment
                    </a>
                  </div>
                ) : null}
              </dl>
              <form action={setOrderStatusAction} className="w-full sm:w-auto">
                <Hidden orderRef={ref} k={k} />
                <input
                  type="hidden"
                  name="status"
                  value={order.status === "complete" ? "active" : "complete"}
                />
                <SubmitButton
                  className={`w-full sm:w-auto ${
                    order.status === "complete"
                      ? "btn-secondary"
                      : "btn-primary"
                  }`}
                >
                  {order.status === "complete"
                    ? "Reopen project"
                    : "Mark project complete"}
                </SubmitButton>
              </form>
            </div>
            <div className="mt-6 border-t-2 border-dashed border-gray-200 pt-6">
              <label className="block text-base font-bold text-gray-800">
                Client&rsquo;s private link
                <input
                  readOnly
                  value={clientLink(order)}
                  className="form-input mt-1 font-mono text-sm"
                />
              </label>
              <p className="mt-2 text-base text-gray-600">
                Share it only with the client. Every update you make here is
                emailed to them too.
              </p>
              {order.demo ? null : (
                <form action={replaceClientLinkAction} className="mt-3">
                  <Hidden orderRef={ref} k={k} />
                  <SubmitButton
                    pendingLabel="Sending…"
                    className="btn-secondary"
                  >
                    Send the client a new link
                  </SubmitButton>
                </form>
              )}
            </div>
          </>
        ) : null}
      </section>
      {launchFirst ? launchKit : null}

      <section className="mt-12">
        <h2 className="font-display flex items-center gap-3 text-3xl font-bold text-gray-800">
          <MessageCircle
            className="h-8 w-8 text-[#FF3333]"
            aria-hidden="true"
          />
          Messages
        </h2>
        <div className="mt-6 rounded-[1.75rem] border-4 border-gray-800 bg-white p-4 sm:p-6">
          {messages.length ? (
            <ol className="space-y-4">
              {messages.map((message, index) => {
                const mine = message.from === role;
                return (
                  <li
                    key={`${message.at}-${index}`}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl sm:max-w-[80%] border-2 border-gray-800 px-5 py-3 ${
                        message.from === "team" ? "bg-[#FFF9E0]" : "bg-white"
                      }`}
                    >
                      <p className="text-sm font-bold text-gray-600">
                        {message.author} · <LocalTime iso={message.at} />
                      </p>
                      {message.text ? (
                        <p className="mt-1 whitespace-pre-wrap text-gray-800">
                          {message.text}
                        </p>
                      ) : null}
                      {message.attachments?.length ? (
                        <MessageFiles
                          files={message.attachments}
                          href={(file, download) =>
                            `/portal/${ref}/file?k=${encodeURIComponent(k)}&p=${encodeURIComponent(file.path)}${download ? "&download=1" : ""}`
                          }
                        />
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-center text-gray-600">
              {isTeam
                ? "No messages yet."
                : "No messages yet. Say hello and send us your brief!"}
            </p>
          )}

          <MessageComposer
            orderRef={ref}
            k={k}
            demo={Boolean(order.demo)}
            directUpload={storeConfigured}
            placeholder={
              isTeam
                ? "Write to the client…"
                : "Your website, what the video should explain, who it's for, and links to any brand files…"
            }
            note={
              isTeam
                ? "The client gets an email with your message."
                : "We reply within 24 hours, and you'll get an email when we do."
            }
          />
        </div>
      </section>
      <section className="mt-12">
        <h2 className="font-display text-3xl font-bold text-gray-800">
          {order.videos.length === 1 ? "Your video" : "Your videos"}
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {order.videos.map((video) => {
            const step = VIDEO_STATUSES.indexOf(video.status);
            return (
              <article key={video.number} className="service-card">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {video.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full border-2 border-gray-800 px-3 py-1 text-sm font-bold ${STATUS_STYLE[video.status]}`}
                  >
                    {video.status}
                  </span>
                </div>
                <div
                  className="mt-4 flex gap-1.5"
                  aria-label={`Step ${step + 1} of ${VIDEO_STATUSES.length}`}
                >
                  {VIDEO_STATUSES.map((status, index) => (
                    <span
                      key={status}
                      className={`h-2.5 flex-1 rounded-full border border-gray-800 ${
                        index <= step ? "bg-[#FF3333]" : "bg-white"
                      }`}
                    />
                  ))}
                </div>
                {video.deliveryUrl ? (
                  <a
                    href={video.deliveryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary mt-6 flex w-full items-center justify-center gap-2 sm:inline-flex sm:w-auto"
                  >
                    <Play className="h-5 w-5 fill-white" aria-hidden="true" />
                    Watch video
                  </a>
                ) : (
                  <p className="mt-4 text-base text-gray-600">
                    {video.status === "Waiting for brief"
                      ? "Send us your brief in the messages below to get started."
                      : "We'll share a link here as soon as there's something to watch."}
                  </p>
                )}

                {isTeam ? (
                  <details className="mt-6 rounded-xl border-2 border-dashed border-gray-300 p-4">
                    <summary className="cursor-pointer font-bold text-gray-800">
                      Update this video
                    </summary>
                    <form action={updateVideoAction} className="mt-4 space-y-3">
                      <Hidden orderRef={ref} k={k} />
                      <input type="hidden" name="number" value={video.number} />
                      <label className="block text-base font-semibold text-gray-700">
                        Title
                        <input
                          name="title"
                          defaultValue={video.title}
                          className="form-input mt-1"
                        />
                      </label>
                      <label className="block text-base font-semibold text-gray-700">
                        Status
                        <select
                          name="status"
                          defaultValue={video.status}
                          className="form-input mt-1"
                        >
                          {VIDEO_STATUSES.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-base font-semibold text-gray-700">
                        Delivery link (YouTube, Vimeo, Drive)
                        <input
                          name="deliveryUrl"
                          type="url"
                          defaultValue={video.deliveryUrl}
                          placeholder="https://"
                          className="form-input mt-1"
                        />
                      </label>
                      <SubmitButton className="btn-primary w-full">
                        Save video
                      </SubmitButton>
                      <p className="text-sm text-gray-600">
                        The client gets an email whenever the status changes or
                        a new link is added.
                      </p>
                    </form>
                  </details>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
      {launchReady && !launchFirst ? launchKit : null}

      {!isTeam ? (
        <p className="mt-10 flex items-center justify-center gap-2 text-center text-base text-gray-600">
          <ExternalLink className="h-5 w-5" aria-hidden="true" />
          Keep this page bookmarked. It&apos;s your private link to this
          project.
        </p>
      ) : null}
    </PortalShell>
  );
}
