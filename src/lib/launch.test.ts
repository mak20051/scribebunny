import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { sendCustomerEmail } from "@/lib/email";
import { sendFollowUps } from "@/lib/launch";
import { getPortalOrder } from "@/lib/portal";
import { daysAgo, NOW, portalOrder, seed } from "@/test/fixtures";

vi.mock("@/lib/email", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/email")>()),
  sendCustomerEmail: vi.fn(async () => undefined),
  sendTeamEmail: vi.fn(async () => undefined),
}));

const sent = vi.mocked(sendCustomerEmail);
const complete = (ref: string, days: number, extra = {}) =>
  portalOrder(ref, `${ref.toLowerCase()}@example.com`, {
    status: "complete",
    completedAt: daysAgo(days),
    ...extra,
  });

beforeAll(() =>
  seed({
    orders: [
      complete("SB-WEEK0001", 8),
      complete("SB-MONTH001", 31),
      complete("SB-MONTH002", 31, { followUps: { day7: daysAgo(24) } }),
      complete("SB-FRESH001", 3),
      complete("SB-FAILS001", 9),
      complete("SB-DEMO0001", 40, { demo: true }),
      complete("SB-NOMAIL01", 40, { client: { name: "No Mail", email: "" } }),
      portalOrder("SB-ACTIVE01", "active@example.com", {
        completedAt: daysAgo(40),
      }),
    ],
  }),
);

beforeEach(() => {
  sent.mockClear();
});

describe("client follow-ups after completion", () => {
  test("sends what is due, once, and day 30 alone when day 7 was missed", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    sent.mockImplementation(async (message) => {
      if (message.to[0] === "sb-fails001@example.com")
        throw new Error("SMTP down");
    });
    const first = await sendFollowUps(NOW);
    expect(logged).toHaveBeenCalledOnce();
    logged.mockRestore();
    expect(first.sent.sort()).toEqual([
      "SB-MONTH001 day30",
      "SB-MONTH002 day30",
      "SB-WEEK0001 day7",
    ]);
    expect(
      sent.mock.calls
        .map(([message]) => [message.to[0], message.subject])
        .sort(),
    ).toEqual([
      ["sb-fails001@example.com", "How's your Scribebunny video doing?"],
      ["sb-month001@example.com", "30 days with your Scribebunny video"],
      ["sb-month002@example.com", "30 days with your Scribebunny video"],
      ["sb-week0001@example.com", "How's your Scribebunny video doing?"],
    ]);
    expect((await getPortalOrder("SB-MONTH001"))?.followUps).toEqual({
      day7: new Date(NOW).toISOString(),
      day30: new Date(NOW).toISOString(),
    });
  });

  test("a failed send is released and goes out on the next run; nothing else repeats", async () => {
    expect(
      (await getPortalOrder("SB-FAILS001"))?.followUps?.day7,
    ).toBeUndefined();
    sent.mockImplementation(async () => undefined);
    const second = await sendFollowUps(NOW + 60_000);
    expect(second.sent).toEqual(["SB-FAILS001 day7"]);
    expect((await sendFollowUps(NOW + 120_000)).sent).toEqual([]);
  });
});
