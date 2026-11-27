import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { send, sendCustomerEmail } from "@/lib/email";
import { fulfil } from "@/lib/payments";
import { getPortalOrder, listPortalOrders } from "@/lib/portal";
import { portalOrder, seed } from "@/test/fixtures";

const sessions = new Map<string, Record<string, unknown>>();

vi.mock("stripe", () => ({
  default: class {
    checkout = {
      sessions: { retrieve: async (id: string) => sessions.get(id) },
    };
    paymentIntents = {
      retrieve: async () => ({ metadata: {} }),
      update: async () => ({}),
    };
  },
}));

vi.mock("@/lib/email", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/email")>()),
  send: vi.fn(async () => undefined),
  sendCustomerEmail: vi.fn(async () => undefined),
  sendTeamEmail: vi.fn(async () => undefined),
}));

const paidSession = (id: string, metadata: Record<string, string>) => ({
  id,
  metadata,
  payment_status: "paid",
  amount_total: 29_900,
  currency: "usd",
  created: 1_795_000_000,
  livemode: false,
  payment_intent: `pi_${id}`,
  invoice: { number: "INV-1", hosted_invoice_url: "https://invoice.example" },
  customer_details: { name: "Ann Buyer", email: "ann@example.com" },
});

beforeAll(async () => {
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_unit");
  sessions.set("cs_other_product", paidSession("cs_other_product", {}));
  sessions.set(
    "cs_quote_payment",
    paidSession("cs_quote_payment", { portal: "SB-QUOTE001" }),
  );
  await seed({
    orders: [
      portalOrder("SB-QUOTE001", "quote@example.com", {
        manual: true,
        payment: { status: "awaiting" },
      }),
    ],
  });
});

beforeEach(() => {
  vi.mocked(send).mockClear();
  vi.mocked(sendCustomerEmail).mockClear();
});

describe("fulfil", () => {
  test("ignores a paid checkout that is not a Scribebunny package or portal", async () => {
    await fulfil("cs_other_product");
    expect(await listPortalOrders()).toHaveLength(1);
    expect(vi.mocked(send)).not.toHaveBeenCalled();
    expect(vi.mocked(sendCustomerEmail)).not.toHaveBeenCalled();
  });

  test("tells the team about a portal payment even when the client's email fails", async () => {
    vi.mocked(sendCustomerEmail).mockRejectedValueOnce(new Error("SMTP down"));
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    await fulfil("cs_quote_payment");
    logged.mockRestore();
    expect((await getPortalOrder("SB-QUOTE001"))?.payment?.status).toBe("paid");
    const subjects = vi
      .mocked(send)
      .mock.calls.map(([message]) => message.subject);
    expect(subjects.length).toBeGreaterThan(0);
    expect(
      subjects.every((subject) => subject.startsWith("💰 Payment received")),
    ).toBe(true);
  });
});
