import { beforeAll, describe, expect, test } from "vitest";
import { growthReport } from "@/lib/growth";
import {
  conceptRequest,
  leadSource as source,
  portalOrder,
  seed,
  storedLead as lead,
} from "@/test/fixtures";

const paid = (cents: number) => ({
  amountCents: cents,
  amount: `$${cents / 100}`,
});

beforeAll(() =>
  seed({
    leads: [
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
    ],
    concepts: [
      conceptRequest("C-1", "ai@example.com", {
        createdAt: "2026-11-13T10:00:00.000Z",
        source: source("AI assistant", "United States"),
      }),
      conceptRequest("C-2", "ads2@example.com", {
        createdAt: "2026-11-14T10:00:00.000Z",
        source: source("Paid search", "Brazil"),
      }),
    ],
    orders: [
      portalOrder("SB-PACKAGE", "ads@example.com", {
        ...paid(99_900),
        source: source("Paid search"),
      }),
      portalOrder("SB-QUOTE", "Quote@Example.com", {
        ...paid(250_000),
        manual: true,
        payment: { status: "paid", paidAt: "2026-11-21T10:00:00.000Z" },
      }),
      portalOrder("SB-STRANGER", "nobody@example.com", paid(50_000)),
      portalOrder("SB-UNPAID", "ai@example.com", {
        ...paid(400_000),
        manual: true,
        payment: { status: "awaiting" },
      }),
    ],
  }),
);

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
