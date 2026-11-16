import { listConceptRequests, type ConceptRequest } from "@/lib/concepts";
import type { LeadSource } from "@/lib/lead-source";
import { listLeads, type StoredLead } from "@/lib/leads";
import {
  isPaid,
  listPortalOrders,
  paidDate,
  type PortalOrder,
} from "@/lib/portal";

/**
 * Growth board numbers, computed live from the site's own records.
 *
 *   enquiries ─┬─ form leads (contact, quote, agency)      leads/
 *              └─ free concept requests                     concepts/
 *   concepts sent ──────────────────────────────────────────▶ concept status "sent"
 *   orders, revenue ────────────────────────────────────────▶ orders/ once paid (Stripe
 *                                                              or marked paid), by payment date
 *   concept → order ── a concept request whose email later placed an order
 *   by channel ── each enquiry's own source; an order's from its checkout, else
 *                 from the first enquiry with the same email (quotes)
 *
 * The board is the owner's only: it opens with the owner's own key (lib/access.ts).
 */

export const RANGES = {
  "7": { label: "Last 7 days", days: 7 },
  "30": { label: "Last 30 days", days: 30 },
  "90": { label: "Last 90 days", days: 90 },
  all: { label: "All time", days: null },
} as const;

export type RangeKey = keyof typeof RANGES;

export type WeekRow = {
  weekStart: string;
  enquiries: number;
  conceptsSent: number;
  orders: number;
  revenueCents: number;
};

export type Activity = { at: string; kind: string; label: string };

export type ChannelRow = {
  channel: string;
  enquiries: number;
  orders: number;
  revenueCents: number;
};

const NOT_RECORDED = "Not recorded";
const channelOf = (source?: LeadSource) =>
  !source || source.channel === "Unknown" ? NOT_RECORDED : source.channel;

/** Paid amount in cents; older orders only stored a formatted amount like "$1,199.00". */
export function orderCents(order: PortalOrder) {
  if (typeof order.amountCents === "number") return order.amountCents;
  return Math.round(Number(order.amount.replace(/[^0-9.]/g, "")) * 100) || 0;
}

const DAY = 86_400_000;

function startOfWeek(date: Date) {
  const day = (date.getUTCDay() + 6) % 7;
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - day,
    ),
  );
}

export async function growthReport(range: RangeKey) {
  const [leads, concepts, allOrders] = await Promise.all([
    listLeads(),
    listConceptRequests(),
    listPortalOrders(),
  ]);
  // Custom-price portals count once the client has paid.
  const orders = allOrders.filter(isPaid);
  const awaitingPayment = allOrders.length - orders.length;

  const days = RANGES[range].days;
  const since = days === null ? 0 : Date.now() - days * DAY;
  const inRange = (iso: string) => new Date(iso).getTime() >= since;

  const rangeLeads = leads.filter((lead) => inRange(lead.createdAt));
  const rangeConcepts = concepts.filter((request) =>
    inRange(request.createdAt),
  );
  const rangeOrders = orders.filter((order) => inRange(paidDate(order)));
  const sent = rangeConcepts.filter((request) => request.status === "sent");
  const revenueCents = rangeOrders.reduce(
    (sum, order) => sum + orderCents(order),
    0,
  );

  const orderEmails = orders.map((order) => ({
    email: order.client.email.toLowerCase(),
    at: paidDate(order),
  }));
  const conceptsThatOrdered = sent.filter((request) =>
    orderEmails.some(
      (order) =>
        order.email === request.lead.email.toLowerCase() &&
        order.at >= request.createdAt,
    ),
  );

  const enquiries = rangeLeads.length + rangeConcepts.length;
  const totals = {
    enquiries,
    formLeads: rangeLeads.length,
    conceptRequests: rangeConcepts.length,
    conceptsSent: sent.length,
    conceptsAwaitingReview: concepts.filter(
      (request) => request.status === "review" || request.status === "failed",
    ).length,
    orders: rangeOrders.length,
    revenueCents,
    averageOrderCents: rangeOrders.length
      ? Math.round(revenueCents / rangeOrders.length)
      : 0,
    conceptToOrderRate: sent.length
      ? conceptsThatOrdered.length / sent.length
      : null,
    enquiryToOrderRate: enquiries ? rangeOrders.length / enquiries : null,
    activeProjects: orders.filter((order) => order.status === "active").length,
    awaitingPayment,
  };

  const funnel = [
    { stage: "Enquiries", count: enquiries },
    { stage: "Concepts sent", count: sent.length },
    { stage: "Orders", count: rangeOrders.length },
    {
      stage: "Projects complete",
      count: rangeOrders.filter((order) => order.status === "complete").length,
    },
  ];

  const byPackage = Object.values(
    rangeOrders.reduce<
      Record<string, { name: string; orders: number; revenueCents: number }>
    >((groups, order) => {
      const group = (groups[order.packageName] ??= {
        name: order.packageName,
        orders: 0,
        revenueCents: 0,
      });
      group.orders += 1;
      group.revenueCents += orderCents(order);
      return groups;
    }, {}),
  ).sort((a, b) => b.revenueCents - a.revenueCents);

  // An order's source: its checkout, else the first enquiry with that email.
  const sourceByEmail = new Map<string, LeadSource>();
  [
    ...leads.map((lead) => ({
      email: lead.email,
      at: lead.createdAt,
      source: lead.source,
    })),
    ...concepts.map((request) => ({
      email: request.lead.email,
      at: request.createdAt,
      source: request.source,
    })),
  ]
    .sort((a, b) => a.at.localeCompare(b.at))
    .forEach(({ email, source }) => {
      const key = email.toLowerCase();
      if (source && !sourceByEmail.has(key)) sourceByEmail.set(key, source);
    });

  const channels = new Map<string, ChannelRow>();
  const channelRow = (channel: string) => {
    let row = channels.get(channel);
    if (!row) {
      row = { channel, enquiries: 0, orders: 0, revenueCents: 0 };
      channels.set(channel, row);
    }
    return row;
  };
  const rangeSources = [
    ...rangeLeads.map((lead) => lead.source),
    ...rangeConcepts.map((request) => request.source),
  ];
  for (const source of rangeSources)
    channelRow(channelOf(source)).enquiries += 1;
  for (const order of rangeOrders) {
    const row = channelRow(
      channelOf(
        order.source ?? sourceByEmail.get(order.client.email.toLowerCase()),
      ),
    );
    row.orders += 1;
    row.revenueCents += orderCents(order);
  }
  const byChannel = [...channels.values()].sort(
    (a, b) =>
      Number(a.channel === NOT_RECORDED) - Number(b.channel === NOT_RECORDED) ||
      b.enquiries - a.enquiries ||
      b.revenueCents - a.revenueCents,
  );

  const countryCounts = new Map<string, number>();
  for (const source of rangeSources) {
    const country = source?.country ?? NOT_RECORDED;
    countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1);
  }
  const countries = [...countryCounts.entries()]
    .map(([country, enquiries]) => ({ country, enquiries }))
    .sort(
      (a, b) =>
        Number(a.country === NOT_RECORDED) -
          Number(b.country === NOT_RECORDED) || b.enquiries - a.enquiries,
    );
  // Top 8; the rest fold into "Other countries".
  const named = countries.filter((row) => row.country !== NOT_RECORDED);
  const byCountry = [
    ...named.slice(0, 8),
    ...(named.length > 8
      ? [
          {
            country: "Other countries",
            enquiries: named
              .slice(8)
              .reduce((sum, row) => sum + row.enquiries, 0),
          },
        ]
      : []),
    ...countries.filter((row) => row.country === NOT_RECORDED),
  ];

  return {
    totals,
    funnel,
    byPackage,
    byChannel,
    byCountry,
    weeks: weeklyRows(leads, concepts, orders, 8),
    recent: recentActivity(leads, concepts, orders, 12),
  };
}

function weeklyRows(
  leads: StoredLead[],
  concepts: ConceptRequest[],
  orders: PortalOrder[],
  count: number,
): WeekRow[] {
  const thisWeek = startOfWeek(new Date());
  const rows: WeekRow[] = Array.from({ length: count }, (_, index) => ({
    weekStart: new Date(thisWeek.getTime() - (count - 1 - index) * 7 * DAY)
      .toISOString()
      .slice(0, 10),
    enquiries: 0,
    conceptsSent: 0,
    orders: 0,
    revenueCents: 0,
  }));
  const rowFor = (iso: string) =>
    rows.find(
      (row) =>
        row.weekStart === startOfWeek(new Date(iso)).toISOString().slice(0, 10),
    );
  for (const lead of leads) {
    const row = rowFor(lead.createdAt);
    if (row) row.enquiries += 1;
  }
  for (const request of concepts) {
    const row = rowFor(request.createdAt);
    if (row) row.enquiries += 1;
    const sentRow = request.sentAt ? rowFor(request.sentAt) : undefined;
    if (sentRow) sentRow.conceptsSent += 1;
  }
  for (const order of orders) {
    const row = rowFor(paidDate(order));
    if (row) {
      row.orders += 1;
      row.revenueCents += orderCents(order);
    }
  }
  return rows;
}

function recentActivity(
  leads: StoredLead[],
  concepts: ConceptRequest[],
  orders: PortalOrder[],
  count: number,
): Activity[] {
  const events: Activity[] = [
    ...leads.map((lead) => ({
      at: lead.createdAt,
      kind: "Lead",
      label: `${lead.name || lead.email} (${lead.type} form${lead.source ? ` · ${lead.source.channel}` : ""})`,
    })),
    ...concepts.map((request) => ({
      at: request.createdAt,
      kind: "Concepts asked",
      label: `${request.lead.name}${request.source ? ` (${request.source.channel})` : ""}`,
    })),
    ...concepts
      .filter((request) => request.sentAt)
      .map((request) => ({
        at: request.sentAt!,
        kind: "Concepts sent",
        label: request.lead.name,
      })),
    ...orders.map((order) => ({
      at: paidDate(order),
      kind: "Order",
      label: `${order.client.name || order.client.email}: ${order.packageName}, ${order.amount}`,
    })),
  ];
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, count);
}
