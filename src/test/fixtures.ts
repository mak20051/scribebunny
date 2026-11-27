import type { ConceptRequest } from "@/lib/concepts";
import type { LeadSource } from "@/lib/lead-source";
import type { StoredLead } from "@/lib/leads";
import type { PortalOrder } from "@/lib/portal";
import { storeConfigured, writeJson } from "@/lib/store";

export const DAY = 86_400_000;
export const NOW = Date.parse("2026-11-20T16:00:00.000Z");
export const daysAgo = (days: number) =>
  new Date(NOW - days * DAY).toISOString();

export const leadSource = (
  channel: LeadSource["channel"],
  country?: string,
): LeadSource => ({ channel, source: "test", country });

export const storedLead = (
  id: string,
  email: string,
  createdAt: string,
  source?: LeadSource,
): StoredLead => ({ id, createdAt, type: "strategy", name: id, email, source });

export const conceptRequest = (
  id: string,
  email: string,
  extra: Partial<ConceptRequest> = {},
): ConceptRequest => ({
  id,
  createdAt: daysAgo(10),
  status: "failed",
  lead: { name: `Pat ${id}`, email, phone: "555" },
  concepts: [],
  ...extra,
});

export const portalOrder = (
  ref: string,
  email: string,
  extra: Partial<PortalOrder> = {},
): PortalOrder => ({
  ref,
  createdAt: daysAgo(10),
  status: "active",
  packageName: "Single video",
  amount: "$299.00",
  amountCents: 29_900,
  client: { name: `Sam ${ref}`, email },
  clientKey: `key-${ref}`,
  videos: [],
  messages: [],
  ...extra,
});

export async function seed(records: {
  leads?: StoredLead[];
  concepts?: ConceptRequest[];
  orders?: PortalOrder[];
}) {
  if (storeConfigured) throw new Error("Tests must not use the real store");
  await Promise.all([
    ...(records.leads ?? []).map((lead) =>
      writeJson(`leads/${lead.id}.json`, lead),
    ),
    ...(records.concepts ?? []).map((request) =>
      writeJson(`concepts/${request.id}.json`, request),
    ),
    ...(records.orders ?? []).map((order) =>
      writeJson(`orders/${order.ref}.json`, order),
    ),
  ]);
}
