import { describe, expect, test } from "vitest";
import { followUpSchedule } from "@/lib/prospect-follow-ups";

const DAY = 86_400_000;
const start = "2026-11-01T12:00:00.000Z";
const at = (days: number) => Date.parse(start) + days * DAY;

describe("followUpSchedule", () => {
  test("both reminders are due on day 2 and day 5", () => {
    expect(followUpSchedule(start, undefined, at(0))).toEqual([
      {
        label: "Day 2 reminder",
        state: "due",
        at: new Date(at(2)).toISOString(),
      },
      {
        label: "Day 5, last reminder",
        state: "due",
        at: new Date(at(5)).toISOString(),
      },
    ]);
  });

  test("a sent reminder shows when it went out", () => {
    const sent = new Date(at(2)).toISOString();
    expect(followUpSchedule(start, { day2: sent }, at(3))[0]).toEqual({
      label: "Day 2 reminder",
      state: "sent",
      at: sent,
    });
  });

  test("stopping turns off what has not gone out", () => {
    const sent = new Date(at(2)).toISOString();
    const rows = followUpSchedule(
      start,
      {
        day2: sent,
        stopped: { at: new Date(at(3)).toISOString(), by: "prospect" },
      },
      at(3),
    );
    expect(rows.map((row) => row.state)).toEqual(["sent", "off"]);
  });

  test("a reminder is still due until 3 days after its day", () => {
    expect(followUpSchedule(start, undefined, at(5) - 1)[0].state).toBe("due");
  });

  test("a reminder 3 days late is skipped, never sent late", () => {
    expect(followUpSchedule(start, undefined, at(5))[0].state).toBe("skipped");
    expect(
      followUpSchedule(start, undefined, at(8)).map((row) => row.state),
    ).toEqual(["skipped", "skipped"]);
  });
});
