import { listConceptRequests, type ConceptRequest } from "@/lib/concepts";
import { listLeads, type StoredLead } from "@/lib/leads";
import { listPortalOrders, type PortalOrder } from "@/lib/portal";

/**
 * Growth board numbers, computed live from the site's own records.
 *
 *   enquiries ─┬─ form leads (contact, quote, agency)      leads/
 *              └─ free concept requests                     concepts/
 *   concepts sent ──────────────────────────────────────────▶ concept status "sent"
 *   orders, revenue ────────────────────────────────────────▶ orders/ (paid via Stripe)
 *   concept → order ── a concept request whose email later placed an order
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
  const [leads, concepts, orders] = await Promise.all([
    listLeads(),
    listConceptRequests(),
    listPortalOrders(),
  ]);

  const days = RANGES[range].days;
  const since = days === null ? 0 : Date.now() - days * DAY;
  const inRange = (iso: string) => new Date(iso).getTime() >= since;

  const rangeLeads = leads.filter((lead) => inRange(lead.createdAt));
  const rangeConcepts = concepts.filter((request) =>
    inRange(request.createdAt),
  );
  const rangeOrders = orders.filter((order) => inRange(order.createdAt));
  const sent = rangeConcepts.filter((request) => request.status === "sent");
  const revenueCents = rangeOrders.reduce(
    (sum, order) => sum + orderCents(order),
    0,
  );

  const orderEmails = orders.map((order) => ({
    email: order.client.email.toLowerCase(),
    at: order.createdAt,
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

  return {
    totals,
    funnel,
    byPackage,
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
    const row = rowFor(order.createdAt);
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
      label: `${lead.name || lead.email} (${lead.type} form)`,
    })),
    ...concepts.map((request) => ({
      at: request.createdAt,
      kind: "Concepts asked",
      label: request.lead.name,
    })),
    ...concepts
      .filter((request) => request.sentAt)
      .map((request) => ({
        at: request.sentAt!,
        kind: "Concepts sent",
        label: request.lead.name,
      })),
    ...orders.map((order) => ({
      at: order.createdAt,
      kind: "Order",
      label: `${order.client.name || order.client.email}: ${order.packageName}, ${order.amount}`,
    })),
  ];
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, count);
}
