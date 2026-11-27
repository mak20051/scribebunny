import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { teamMembers } from "@/lib/access";
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
  sessions.set(
    "cs_package_1",
    paidSession("cs_package_1", { package: "single" }),
  );
  sessions.set(
    "cs_package_2",
    paidSession("cs_package_2", { package: "single" }),
  );
  for (const id of ["cs_first_pay", "cs_second_pay"]) {
    sessions.set(id, paidSession(id, { portal: "SB-TWICE001" }));
  }
  await seed({
    orders: [
      portalOrder("SB-QUOTE001", "quote@example.com", {
        manual: true,
        payment: { status: "awaiting" },
      }),
      portalOrder("SB-TWICE001", "twice@example.com", {
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
    expect(await listPortalOrders()).toHaveLength(2);
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

const subjects = (start: string) =>
  vi
    .mocked(send)
    .mock.calls.map(([message]) => message.subject)
    .filter((subject) => subject.startsWith(start));

describe("package orders", () => {
  test("two runs at once tell the team and the client once", async () => {
    await Promise.all([fulfil("cs_package_1"), fulfil("cs_package_1")]);
    expect(subjects("💰 New order")).toHaveLength((await teamMembers()).length);
    expect(vi.mocked(sendCustomerEmail)).toHaveBeenCalledOnce();
  });

  test("a failed team alert is sent again on the next run", async () => {
    vi.mocked(send).mockRejectedValueOnce(new Error("SMTP down"));
    await expect(fulfil("cs_package_2")).rejects.toThrow("SMTP down");
    expect(vi.mocked(sendCustomerEmail)).not.toHaveBeenCalled();
    vi.mocked(send).mockClear();
    await fulfil("cs_package_2");
    expect(subjects("💰 New order")).toHaveLength((await teamMembers()).length);
    expect(vi.mocked(sendCustomerEmail)).toHaveBeenCalledOnce();
  });
});

describe("a portal paid twice", () => {
  test("tells the team once to refund the second payment", async () => {
    await fulfil("cs_first_pay");
    vi.mocked(send).mockClear();
    await Promise.all([fulfil("cs_second_pay"), fulfil("cs_second_pay")]);
    await fulfil("cs_first_pay");
    expect(subjects("⚠️ Paid twice")).toHaveLength(
      (await teamMembers()).length,
    );
    expect(subjects("💰")).toHaveLength(0);
    expect((await getPortalOrder("SB-TWICE001"))?.duplicatePayments).toEqual([
      "https://dashboard.stripe.com/test/payments/pi_cs_second_pay",
    ]);
  });
});
