import { beforeAll, describe, expect, test } from "vitest";
import type { ConceptRequest } from "@/lib/concepts";
import { growthReport } from "@/lib/growth";
import type { LeadSource } from "@/lib/lead-source";
import type { StoredLead } from "@/lib/leads";
import type { PortalOrder } from "@/lib/portal";
import { storeConfigured, writeJson } from "@/lib/store";

const source = (
  channel: LeadSource["channel"],
  country?: string,
): LeadSource => ({
  channel,
  source: "test",
  country,
});

const lead = (
  id: string,
  email: string,
  createdAt: string,
  leadSource?: LeadSource,
): StoredLead => ({
  id,
  createdAt,
  type: "strategy",
  name: id,
  email,
  source: leadSource,
});

const conceptRequest = (
  id: string,
  email: string,
  createdAt: string,
  leadSource?: LeadSource,
): ConceptRequest => ({
  id,
  createdAt,
  status: "failed",
  lead: { name: id, email, phone: "555" },
  concepts: [],
  source: leadSource,
});

const order = (
  ref: string,
  email: string,
  amountCents: number,
  extra: Partial<PortalOrder> = {},
): PortalOrder => ({
  ref,
  createdAt: "2026-11-20T10:00:00.000Z",
  status: "active",
  packageName: "Single video",
  amount: `$${amountCents / 100}`,
  amountCents,
  client: { name: ref, email },
  videos: [],
  messages: [],
  ...extra,
});

beforeAll(async () => {
  expect(storeConfigured).toBe(false);
  const leads = [
    lead(
      "L-1",
      "ads@example.com",
      "2026-11-10T10:00:00.000Z",
      source("Paid search", "United States"),
    ),
    lead(
      "L-2",
      "quote@example.com",
      "2026-11-11T10:00:00.000Z",
      source("Organic search", "Canada"),
    ),
    lead(
      "L-3",
      "quote@example.com",
      "2026-11-12T10:00:00.000Z",
      source("Email", "Canada"),
    ),
    lead("L-4", "old@example.com", "2026-11-01T10:00:00.000Z"),
  ];
  const concepts = [
    conceptRequest(
      "C-1",
      "ai@example.com",
      "2026-11-13T10:00:00.000Z",
      source("AI assistant", "United States"),
    ),
    conceptRequest(
      "C-2",
      "ads2@example.com",
      "2026-11-14T10:00:00.000Z",
      source("Paid search", "Brazil"),
    ),
  ];
  const orders = [
    order("SB-PACKAGE", "ads@example.com", 99_900, {
      source: source("Paid search"),
    }),
    order("SB-QUOTE", "Quote@Example.com", 250_000, {
      manual: true,
      payment: { status: "paid", paidAt: "2026-11-21T10:00:00.000Z" },
    }),
    order("SB-STRANGER", "nobody@example.com", 50_000),
    order("SB-UNPAID", "ai@example.com", 400_000, {
      manual: true,
      payment: { status: "awaiting" },
    }),
  ];
  await Promise.all([
    ...leads.map((item) => writeJson(`leads/${item.id}.json`, item)),
    ...concepts.map((item) => writeJson(`concepts/${item.id}.json`, item)),
    ...orders.map((item) => writeJson(`orders/${item.ref}.json`, item)),
  ]);
});

describe("growth board sources", () => {
  test("enquiries, orders and revenue by channel", async () => {
    const { byChannel } = await growthReport("all");
    expect(byChannel).toEqual([
      { channel: "Paid search", enquiries: 2, orders: 1, revenueCents: 99_900 },
      {
        channel: "Organic search",
        enquiries: 1,
        orders: 1,
        revenueCents: 250_000,
      },
      { channel: "Email", enquiries: 1, orders: 0, revenueCents: 0 },
      { channel: "AI assistant", enquiries: 1, orders: 0, revenueCents: 0 },
      {
        channel: "Not recorded",
        enquiries: 1,
        orders: 1,
        revenueCents: 50_000,
      },
    ]);
  });

  test("enquiries by country, with unrecorded ones last", async () => {
    const { byCountry } = await growthReport("all");
    expect(byCountry).toEqual([
      { country: "United States", enquiries: 2 },
      { country: "Canada", enquiries: 2 },
      { country: "Brazil", enquiries: 1 },
      { country: "Not recorded", enquiries: 1 },
    ]);
  });

  test("unpaid quotes are not orders", async () => {
    const { totals } = await growthReport("all");
    expect(totals).toMatchObject({
      enquiries: 6,
      orders: 3,
      revenueCents: 399_900,
      awaitingPayment: 1,
    });
  });
});
