import { beforeAll, expect, test, vi } from "vitest";
import { sendCustomerEmail } from "@/lib/email";
import { getPortalOrder, markPortalPaid } from "@/lib/portal";
import { daysAgo, portalOrder, seed } from "@/test/fixtures";

vi.mock("@/lib/email", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/email")>()),
  sendCustomerEmail: vi.fn(async () => undefined),
  sendTeamEmail: vi.fn(async () => undefined),
}));

beforeAll(() =>
  seed({
    orders: [
      portalOrder("SB-QUOTE001", "quote@example.com", {
        createdAt: daysAgo(3),
        manual: true,
        payment: { status: "awaiting" },
      }),
    ],
  }),
);

test("a payment settled by the webhook and the return page at once counts once", async () => {
  const results = await Promise.all([
    markPortalPaid("SB-QUOTE001", { method: "stripe" }),
    markPortalPaid("SB-QUOTE001", { method: "stripe" }),
  ]);
  expect(results.filter(Boolean)).toHaveLength(1);
  expect(vi.mocked(sendCustomerEmail)).toHaveBeenCalledOnce();
  expect((await getPortalOrder("SB-QUOTE001"))?.payment?.status).toBe("paid");
});
