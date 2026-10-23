import type { Metadata } from "next";
import Link from "next/link";
import { LocalTime } from "@/components/local-time";
import { PortalShell } from "@/components/portal-shell";
import { isAdminKey, listPortalOrders } from "@/lib/portal";

export const metadata: Metadata = {
  title: "Orders | Scribebunny Studio",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ k?: string }> };

/** The studio's list of every order. Opened with the admin key from order alerts. */
export default async function PortalDashboardPage({ searchParams }: Props) {
  const { k = "" } = await searchParams;
  if (!isAdminKey(k)) {
    return (
      <PortalShell label="Studio">
        <p className="text-center text-lg text-gray-700">
          Open this page from the &ldquo;All orders&rdquo; link in an order
          email.
        </p>
      </PortalShell>
    );
  }

  const orders = await listPortalOrders();
  const open = orders.filter((order) => order.status === "active");
  const done = orders.filter((order) => order.status === "complete");

  return (
    <PortalShell label="Studio">
      <h1 className="font-display text-4xl font-bold text-gray-800">Orders</h1>
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
    </PortalShell>
  );
}
