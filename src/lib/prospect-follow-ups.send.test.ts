import { beforeAll, describe, expect, test, vi } from "vitest";
import { sendCustomerEmail } from "@/lib/email";
import {
  sendProspectFollowUps,
  stopByProspect,
  stopLinkState,
} from "@/lib/prospect-follow-ups";
import { getConceptRequest } from "@/lib/concepts";
import {
  conceptRequest,
  daysAgo,
  NOW,
  portalOrder,
  seed,
} from "@/test/fixtures";

vi.mock("@/lib/email", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/email")>()),
  sendCustomerEmail: vi.fn(async () => undefined),
  sendTeamEmail: vi.fn(async () => undefined),
}));

const sent = vi.mocked(sendCustomerEmail);
const conceptsSent = (id: string, email: string, days: number, extra = {}) =>
  conceptRequest(id, email, {
    status: "sent",
    sentAt: daysAgo(days),
    ...extra,
  });
const quote = (ref: string, email: string, days: number, extra = {}) =>
  portalOrder(ref, email, {
    createdAt: daysAgo(days),
    manual: true,
    payment: { status: "awaiting" },
    ...extra,
  });

beforeAll(() =>
  seed({
    concepts: [
      conceptsSent("C-DAY2AAAA", "day2@example.com", 2.5),
      conceptsSent("C-DAY5AAAA", "day5@example.com", 6),
      conceptsSent("C-LATEAAAA", "late@example.com", 9),
      conceptsSent("C-BUYERAAA", "Buyer@Example.com", 3),
      conceptsSent("C-STOPAAAA", "stop@example.com", 3, {
        followUps: { stopped: { at: daysAgo(1), by: "team" } },
      }),
      conceptRequest("C-DRAFTAAA", "draft@example.com", { status: "review" }),
    ],
    orders: [
      portalOrder("SB-BUYER001", "buyer@example.com"),
      quote("SB-QUOTE001", "quote@example.com", 2.1),
      quote("SB-PAID0001", "paid@example.com", 2.1, {
        payment: { status: "paid", paidAt: daysAgo(1) },
      }),
      quote("SB-DEMOQ001", "demo@example.com", 2.1, { demo: true }),
      quote("SB-OLDQUOTE", "revised@example.com", 2.1),
      quote("SB-NEWQUOTE", "Revised@Example.com", 1, {
        payment: { status: "paid", paidAt: daysAgo(0.5) },
      }),
    ],
  }),
);

describe("prospect follow-ups", () => {
  test("sends day 2 or day 5 when due, never to buyers, stopped or late prospects, or for a quote they replaced and paid", async () => {
    const result = await sendProspectFollowUps(NOW);
    expect(result.sent.sort()).toEqual([
      "C-DAY2AAAA day2",
      "C-DAY5AAAA day5",
      "SB-QUOTE001 day2",
    ]);
    const byRecipient = Object.fromEntries(
      sent.mock.calls.map(([message]) => [message.to[0], message]),
    );
    expect(Object.keys(byRecipient).sort()).toEqual([
      "day2@example.com",
      "day5@example.com",
      "quote@example.com",
    ]);
    for (const message of Object.values(byRecipient)) {
      expect(message.headers?.["List-Unsubscribe-Post"]).toBe(
        "List-Unsubscribe=One-Click",
      );
      expect(message.html).toContain("Stop these reminders");
    }
  });

  test("day 5 sent first marks day 2 too, and a second run sends nothing", async () => {
    const marks = (await getConceptRequest("C-DAY5AAAA"))?.followUps;
    expect(marks?.day2).toBe(marks?.day5);
    expect((await sendProspectFollowUps(NOW + 60_000)).sent).toEqual([]);
  });

  test("the stop link works only with its own key", async () => {
    const key =
      (await getConceptRequest("C-DAY2AAAA"))?.followUps?.stopKey ?? "";
    expect(key).not.toBe("");
    expect(await stopLinkState("C-DAY2AAAA", "wrong-key")).toBe("unknown");
    expect(await stopByProspect("C-DAY2AAAA", "wrong-key")).toBe(false);
    expect(await stopLinkState("C-DAY2AAAA", key)).toBe("active");
    expect(await stopByProspect("C-DAY2AAAA", key)).toBe(true);
    expect(await stopLinkState("C-DAY2AAAA", key)).toBe("stopped");
    expect(await stopLinkState("../orders/x", key)).toBe("unknown");
  });

  test("a stopped prospect gets no day 5", async () => {
    expect(
      (await sendProspectFollowUps(NOW + 3.5 * 86_400_000)).sent,
    ).not.toContain("C-DAY2AAAA day5");
  });

  test("two runs at once send each reminder once", async () => {
    sent.mockClear();
    await seed({
      concepts: [conceptsSent("C-RACEAAAA", "race@example.com", 2.2)],
    });
    const runs = await Promise.all([
      sendProspectFollowUps(NOW),
      sendProspectFollowUps(NOW),
    ]);
    expect(runs.flatMap((run) => run.sent)).toEqual(["C-RACEAAAA day2"]);
    expect(sent).toHaveBeenCalledOnce();
  });
});
