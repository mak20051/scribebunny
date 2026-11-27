import { beforeAll, expect, test, vi } from "vitest";
import { resetDemoAction } from "@/app/portal/actions";
import { teamMembers } from "@/lib/access";
import { DEMO_REF, getPortalOrder, updateOrder } from "@/lib/portal";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
};

let clientKey = "";

beforeAll(async () => {
  clientKey = (await getPortalOrder(DEMO_REF))?.clientKey ?? "";
  await updateOrder(DEMO_REF, (demo) => {
    demo.videos[0].title = "Changed by a visitor";
  });
});

const firstTitle = async () =>
  (await getPortalOrder(DEMO_REF))?.videos[0].title;

test("Reset demo is refused without a team key", async () => {
  const attempts: Record<string, string>[] = [
    {},
    { ref: DEMO_REF, k: clientKey },
  ];
  for (const fields of attempts) {
    await expect(resetDemoAction(form(fields))).rejects.toThrow(
      "This portal link is not allowed to do that.",
    );
  }
  expect(await firstTitle()).toBe("Changed by a visitor");
});

test("the team can reset the demo", async () => {
  const [member] = await teamMembers();
  await resetDemoAction(form({ ref: DEMO_REF, k: member.key }));
  expect(await firstTitle()).not.toBe("Changed by a visitor");
});
