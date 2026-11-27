import { expect, test } from "vitest";
import { isPrivatePath } from "@/lib/private-paths";

test.each([
  ["/portal", true],
  ["/portal/SB-1234ABCD", true],
  ["/portal/growth", true],
  ["/concepts/C-1234ABCD", true],
  ["/stop-reminders", true],
  ["/api/leads", true],
  ["/api", true],
  ["/", false],
  ["/contact", false],
  ["/free-concepts", false],
  ["/portals", false],
  ["/conceptsx", false],
  ["/apiary", false],
])("%s is private: %s", (path, expected) => {
  expect(isPrivatePath(path)).toBe(expected);
});
