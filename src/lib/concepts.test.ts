import { beforeAll, beforeEach, expect, test, vi } from "vitest";
import { sendCustomerEmail } from "@/lib/email";
import {
  draftConcepts,
  getConceptRequest,
  saveConcepts,
  sendConcepts,
  type Concept,
} from "@/lib/concepts";
import { sendProspectFollowUps } from "@/lib/prospect-follow-ups";
import { conceptRequest, DAY, seed } from "@/test/fixtures";

vi.mock("@/lib/email", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/email")>()),
  send: vi.fn(async () => undefined),
  sendCustomerEmail: vi.fn(async () => undefined),
  sendTeamEmail: vi.fn(async () => undefined),
}));

const concepts = (label: string): Concept[] =>
  [1, 2, 3].map((number) => ({
    title: `${label} ${number}`,
    style: "Whiteboard",
    hook: `${label} hook ${number}`,
    story: [`${label} beat ${number}`],
    visuals: "Hand-drawn",
    whyItFits: "It fits",
  }));

const sentTitles = async (id: string) =>
  (await getConceptRequest(id))?.sentConcepts?.map((concept) => concept.title);

beforeAll(async () => {
  vi.stubEnv("DEEPSEEK_API_KEY", "unit-test");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({ concepts: concepts("Redrafted") }),
            },
          },
        ],
      }),
    ),
  );
  await seed({
    concepts: [
      conceptRequest("C-EDITEDAA", "edited@example.com", {
        status: "review",
        concepts: concepts("Received"),
      }),
      conceptRequest("C-RESENDAA", "resend@example.com", {
        status: "review",
        concepts: concepts("Received"),
      }),
    ],
  });
});

beforeEach(() => {
  vi.mocked(sendCustomerEmail).mockClear();
});

test("the day 2 reminder lists the concepts the prospect received, not later edits", async () => {
  await sendConcepts("C-EDITEDAA");
  await saveConcepts("C-EDITEDAA", concepts("Edited"));
  await draftConcepts("C-EDITEDAA");
  vi.mocked(sendCustomerEmail).mockClear();

  await sendProspectFollowUps(Date.now() + 2.5 * DAY);

  const reminder = vi
    .mocked(sendCustomerEmail)
    .mock.calls.map(([message]) => message)
    .find((message) => message.to[0] === "edited@example.com");
  expect(reminder?.text).toContain("1. Received 1 (Whiteboard)");
  expect(reminder?.text).not.toMatch(/Edited|Redrafted/);
});

test("sending again records the new concepts; a failed send keeps the old ones", async () => {
  await sendConcepts("C-RESENDAA");
  await saveConcepts("C-RESENDAA", concepts("Revised"));
  await sendConcepts("C-RESENDAA");
  expect(await sentTitles("C-RESENDAA")).toEqual([
    "Revised 1",
    "Revised 2",
    "Revised 3",
  ]);

  await saveConcepts("C-RESENDAA", concepts("Unsent"));
  vi.mocked(sendCustomerEmail).mockRejectedValueOnce(new Error("SMTP down"));
  await expect(sendConcepts("C-RESENDAA")).rejects.toThrow("SMTP down");
  expect(await sentTitles("C-RESENDAA")).toEqual([
    "Revised 1",
    "Revised 2",
    "Revised 3",
  ]);
});
