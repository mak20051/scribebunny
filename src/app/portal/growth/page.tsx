import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LocalTime } from "@/components/local-time";
import { PortalShell } from "@/components/portal-shell";
import {
  growthReport,
  RANGES,
  type RangeKey,
  type WeekRow,
} from "@/lib/growth";
import { formatUsd } from "@/lib/packages";
import { memberForKey } from "@/lib/access";

export const metadata: Metadata = {
  title: "Growth | Scribebunny Studio",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ k?: string; range?: string }>;
};

const BAR = "#FF3333";

const percent = (rate: number | null) =>
  rate === null ? "–" : `${Math.round(rate * 100)}%`;

const weekLabel = (weekStart: string) =>
  new Date(`${weekStart}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

function StatTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border-[3px] border-gray-800 bg-white p-5">
      <p className="text-sm font-bold tracking-wide text-gray-500 uppercase">
        {label}
      </p>
      <p className="font-display mt-1 text-4xl font-bold text-gray-800">
        {value}
      </p>
      {detail ? <p className="mt-1 text-base text-gray-600">{detail}</p> : null}
    </div>
  );
}

/** One series of weekly bars: baseline-anchored, hover or focus shows the value. */
function WeeklyBars({
  title,
  weeks,
  value,
  format,
}: {
  title: string;
  weeks: WeekRow[];
  value: (week: WeekRow) => number;
  format: (amount: number) => string;
}) {
  const max = Math.max(...weeks.map(value), 0);
  return (
    <figure className="rounded-2xl border-[3px] border-gray-800 bg-white p-5">
      <figcaption className="text-lg font-bold text-gray-800">
        {title}
      </figcaption>
      <div className="mt-4 flex h-44 items-end gap-1.5 border-b-2 border-gray-300">
        {weeks.map((week, index) => {
          const amount = value(week);
          // Keep the edge tooltips inside the card on narrow screens.
          const anchor =
            index === 0
              ? "left-0"
              : index === weeks.length - 1
                ? "right-0"
                : "left-1/2 -translate-x-1/2";
          return (
            <div
              key={week.weekStart}
              tabIndex={0}
              aria-label={`Week of ${weekLabel(week.weekStart)}: ${format(amount)}`}
              className="group relative flex h-full flex-1 items-end outline-none"
            >
              <span
                className={`pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-lg bg-gray-800 px-2 py-1 text-sm font-semibold whitespace-nowrap text-white group-hover:block group-focus:block ${anchor}`}
              >
                {weekLabel(week.weekStart)}: {format(amount)}
              </span>
              <span
                className="block w-full rounded-t-[4px] transition-opacity group-hover:opacity-80"
                style={{
                  height: max
                    ? `${Math.max((amount / max) * 100, amount ? 3 : 0)}%`
                    : 0,
                  background: BAR,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 text-xs text-gray-500">
        {weeks.map((week) => (
          <span key={week.weekStart} className="flex-1 text-center">
            {weekLabel(week.weekStart)}
          </span>
        ))}
      </div>
      {max === 0 ? (
        <p className="mt-3 text-base text-gray-600">
          Nothing in these weeks yet.
        </p>
      ) : null}
    </figure>
  );
}

function BarList({
  rows,
}: {
  rows: { label: string; value: number; display: string; note?: string }[];
}) {
  const max = Math.max(...rows.map((row) => row.value), 0);
  return (
    <ul className="space-y-4">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex items-baseline justify-between gap-4 text-base">
            <span className="font-semibold text-gray-800">{row.label}</span>
            <span className="text-gray-700">
              <strong className="text-gray-800">{row.display}</strong>
              {row.note ? ` · ${row.note}` : null}
            </span>
          </div>
          <div className="mt-1 h-3 rounded-full bg-gray-100">
            <div
              className="h-3 rounded-full"
              style={{
                width: max
                  ? `${Math.max((row.value / max) * 100, row.value ? 2 : 0)}%`
                  : 0,
                background: BAR,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function GrowthPage({ searchParams }: Props) {
  const { k = "", range: rawRange = "30" } = await searchParams;
  const member = await memberForKey(k);
  if (!member?.owner) {
    return (
      <PortalShell label="Studio">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-3xl font-bold text-gray-800">
            Growth board
          </h1>
          <p className="mt-3 text-lg text-gray-700">
            This board is private to the studio owner. Open it from the Growth
            board button on your studio dashboard.
          </p>
          <Link href="/portal" className="btn-secondary mt-6 inline-flex">
            Studio dashboard
          </Link>
        </div>
      </PortalShell>
    );
  }

  const range: RangeKey = rawRange in RANGES ? (rawRange as RangeKey) : "30";
  const { totals, funnel, byPackage, weeks, recent } =
    await growthReport(range);
  const key = encodeURIComponent(k);

  return (
    <PortalShell label="Studio">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={`/portal?k=${key}`}
            className="inline-flex items-center gap-1 text-base font-bold text-[#FF3333] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Orders
          </Link>
          <h1 className="font-display mt-1 text-4xl font-bold text-gray-800">
            Growth board
          </h1>
        </div>
        <nav aria-label="Time range" className="flex flex-wrap gap-2">
          {(Object.keys(RANGES) as RangeKey[]).map((option) => (
            <Link
              key={option}
              href={`/portal/growth?k=${key}&range=${option}`}
              aria-current={option === range ? "page" : undefined}
              className={`filter-btn ${option === range ? "active" : ""}`}
            >
              {RANGES[option].label}
            </Link>
          ))}
        </nav>
      </div>

      <section
        aria-label="Key numbers"
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <StatTile
          label="Enquiries"
          value={String(totals.enquiries)}
          detail={`${totals.formLeads} form leads · ${totals.conceptRequests} concept requests`}
        />
        <StatTile
          label="Concepts sent"
          value={String(totals.conceptsSent)}
          detail={
            totals.conceptsAwaitingReview
              ? `${totals.conceptsAwaitingReview} waiting for review`
              : "None waiting for review"
          }
        />
        <StatTile
          label="Orders"
          value={String(totals.orders)}
          detail={`${totals.activeProjects} projects in progress`}
        />
        <StatTile
          label="Revenue"
          value={formatUsd(totals.revenueCents)}
          detail={`Average order ${formatUsd(totals.averageOrderCents)}`}
        />
        <StatTile
          label="Concept → order"
          value={percent(totals.conceptToOrderRate)}
          detail="Concepts sent that became an order"
        />
        <StatTile
          label="Enquiry → order"
          value={percent(totals.enquiryToOrderRate)}
          detail="Orders per enquiry in this range"
        />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border-[3px] border-gray-800 bg-white p-5">
          <h2 className="text-lg font-bold text-gray-800">
            Funnel · {RANGES[range].label.toLowerCase()}
          </h2>
          <div className="mt-4">
            <BarList
              rows={funnel.map((step, index) => ({
                label: step.stage,
                value: step.count,
                display: String(step.count),
                note:
                  index && funnel[index - 1].count
                    ? `${Math.round((step.count / funnel[index - 1].count) * 100)}% of previous`
                    : undefined,
              }))}
            />
          </div>
        </section>
        <section className="rounded-2xl border-[3px] border-gray-800 bg-white p-5">
          <h2 className="text-lg font-bold text-gray-800">
            Revenue by package
          </h2>
          <div className="mt-4">
            {byPackage.length ? (
              <BarList
                rows={byPackage.map((group) => ({
                  label: group.name,
                  value: group.revenueCents,
                  display: formatUsd(group.revenueCents),
                  note: `${group.orders} ${group.orders === 1 ? "order" : "orders"}`,
                }))}
              />
            ) : (
              <p className="text-base text-gray-600">
                No orders in this range yet.
              </p>
            )}
          </div>
        </section>
      </div>

      <section aria-label="Last 8 weeks" className="mt-8">
        <h2 className="font-display text-3xl font-bold text-gray-800">
          Last 8 weeks
        </h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <WeeklyBars
            title="Enquiries per week"
            weeks={weeks}
            value={(week) => week.enquiries}
            format={(amount) =>
              `${amount} ${amount === 1 ? "enquiry" : "enquiries"}`
            }
          />
          <WeeklyBars
            title="Revenue per week"
            weeks={weeks}
            value={(week) => week.revenueCents}
            format={formatUsd}
          />
        </div>
        <details className="mt-4 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-4">
          <summary className="cursor-pointer font-bold text-gray-800">
            Show as a table
          </summary>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-base">
              <thead className="text-sm text-gray-500 uppercase">
                <tr>
                  <th className="py-2 pr-4">Week of</th>
                  <th className="py-2 pr-4">Enquiries</th>
                  <th className="py-2 pr-4">Concepts sent</th>
                  <th className="py-2 pr-4">Orders</th>
                  <th className="py-2">Revenue</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {weeks.map((week) => (
                  <tr key={week.weekStart} className="border-t border-gray-200">
                    <td className="py-2 pr-4">{weekLabel(week.weekStart)}</td>
                    <td className="py-2 pr-4">{week.enquiries}</td>
                    <td className="py-2 pr-4">{week.conceptsSent}</td>
                    <td className="py-2 pr-4">{week.orders}</td>
                    <td className="py-2">{formatUsd(week.revenueCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section className="mt-8 rounded-2xl border-[3px] border-gray-800 bg-white p-5">
        <h2 className="text-lg font-bold text-gray-800">Recent activity</h2>
        {recent.length ? (
          <ul className="mt-4 divide-y divide-gray-200">
            {recent.map((event, index) => (
              <li
                key={`${event.at}-${index}`}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3"
              >
                <span>
                  <span className="mr-2 rounded-full border-2 border-gray-800 bg-[#FFF9E0] px-2 py-0.5 text-sm font-bold text-gray-800">
                    {event.kind}
                  </span>
                  <span className="text-gray-800">{event.label}</span>
                </span>
                <span className="text-sm text-gray-500">
                  <LocalTime iso={event.at} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-base text-gray-600">No activity yet.</p>
        )}
      </section>
    </PortalShell>
  );
}
