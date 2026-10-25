import type { Metadata } from "next";
import Link from "next/link";
import { LocalTime } from "@/components/local-time";
import { PortalShell } from "@/components/portal-shell";
import { SubmitButton } from "@/components/submit-button";
import { resendTeamLinkAction } from "@/app/portal/actions";
import { memberForKey } from "@/lib/access";
import { listConceptRequests } from "@/lib/concepts";
import { listPortalOrders } from "@/lib/portal";

export const metadata: Metadata = {
  title: "Orders | Scribebunny Studio",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ k?: string; sent?: string }> };

/** The studio's list of every order. Each team member opens it with their own key. */
export default async function PortalDashboardPage({ searchParams }: Props) {
  const { k = "", sent } = await searchParams;
  const member = await memberForKey(k);
  if (!member) {
    return (
      <PortalShell label="Studio">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-3xl font-bold text-gray-800">
            Studio dashboard
          </h1>
          <p className="mt-3 text-lg text-gray-700">
            Open it from the &ldquo;All orders&rdquo; link in your own copy of
            an order email.
          </p>
          {sent ? (
            <p
              role="status"
              className="mt-6 text-lg font-semibold text-gray-800"
            >
              If that email is on the team, its private link is on the way.
            </p>
          ) : (
            <form
              action={resendTeamLinkAction}
              className="mt-8 space-y-3 text-left"
            >
              <label className="block text-base font-semibold text-gray-700">
                Lost your link? Enter your team email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="form-input mt-1"
                />
              </label>
              <SubmitButton
                pendingLabel="Sending…"
                className="btn-primary w-full"
              >
                Email me my link
              </SubmitButton>
            </form>
          )}
        </div>
      </PortalShell>
    );
  }

  const [orders, conceptRequests] = await Promise.all([
    listPortalOrders(),
    listConceptRequests(),
  ]);
  const open = orders.filter((order) => order.status === "active");
  const done = orders.filter((order) => order.status === "complete");

  return (
    <PortalShell label="Studio">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-gray-800">
          Orders
        </h1>
        {member.owner ? (
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/portal/growth?k=${member.key}`}
              className="btn-secondary"
            >
              Growth board
            </Link>
            <Link
              href={`/portal/access?k=${member.key}`}
              className="btn-secondary"
            >
              Team access
            </Link>
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-lg text-gray-700">
        {open.length} in progress · {done.length} complete
      </p>

      {orders.length ? (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => {
            const completed = order.videos.filter(
              (video) => video.status === "Complete",
            ).length;
            return (
              <li key={order.ref}>
                <Link
                  href={`/portal/${order.ref}?k=${encodeURIComponent(k)}`}
                  className="service-card block p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold tracking-widest text-[#FF3333] uppercase">
                        {order.ref}
                      </p>
                      <p className="mt-1 text-xl font-bold text-gray-800">
                        {order.client.name || order.client.email}
                      </p>
                      <p className="text-base text-gray-600">
                        {order.packageName} · {order.amount} ·{" "}
                        <LocalTime iso={order.createdAt} />
                      </p>
                    </div>
                    <span
                      className={`rounded-full border-2 border-gray-800 px-3 py-1 text-sm font-bold ${
                        order.status === "complete"
                          ? "bg-green-600 text-white"
                          : "bg-[#FFE66D] text-gray-800"
                      }`}
                    >
                      {order.status === "complete"
                        ? "Complete"
                        : `${completed}/${order.videos.length} videos done`}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-8 text-lg text-gray-600">No orders yet.</p>
      )}

      <h2 className="font-display mt-16 text-3xl font-bold text-gray-800">
        Free concept requests
      </h2>
      {conceptRequests.length ? (
        <ul className="mt-6 space-y-4">
          {conceptRequests.map((request) => (
            <li key={request.id}>
              <Link
                href={`/concepts/${request.id}?k=${encodeURIComponent(k)}`}
                className="service-card block p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold tracking-widest text-[#FF3333] uppercase">
                      {request.id}
                    </p>
                    <p className="mt-1 text-xl font-bold text-gray-800">
                      {request.lead.name}
                    </p>
                    <p className="text-base text-gray-600">
                      {request.lead.website || request.lead.email} ·{" "}
                      <LocalTime iso={request.createdAt} />
                    </p>
                  </div>
                  <span
                    className={`rounded-full border-2 border-gray-800 px-3 py-1 text-sm font-bold ${
                      request.status === "sent"
                        ? "bg-green-600 text-white"
                        : request.status === "failed"
                          ? "bg-[#FF6B6B] text-white"
                          : "bg-[#FFE66D] text-gray-800"
                    }`}
                  >
                    {request.status === "sent"
                      ? "Sent"
                      : request.status === "review"
                        ? "Ready to review"
                        : request.status === "failed"
                          ? "Needs writing"
                          : "Drafting"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-lg text-gray-600">No concept requests yet.</p>
      )}
    </PortalShell>
  );
}
