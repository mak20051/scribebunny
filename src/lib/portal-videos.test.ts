import { beforeAll, expect, test, vi } from "vitest";
import { sendCustomerEmail } from "@/lib/email";
import { getPortalOrder, updateVideo } from "@/lib/portal";
import { portalOrder, seed } from "@/test/fixtures";

vi.mock("@/lib/email", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/email")>()),
  sendCustomerEmail: vi.fn(async () => undefined),
  sendTeamEmail: vi.fn(async () => undefined),
}));

beforeAll(() =>
  seed({
    orders: [
      portalOrder("SB-VIDEO001", "client@example.com", {
        videos: [
          {
            number: 1,
            title: "Product tour",
            status: "Waiting for brief",
            updatedAt: "2026-11-01T10:00:00.000Z",
          },
        ],
      }),
    ],
  }),
);

test("saving a video with an empty title keeps its title and still emails the client", async () => {
  await updateVideo("SB-VIDEO001", 1, {
    title: undefined,
    status: "Script & storyboard",
  });
  const video = (await getPortalOrder("SB-VIDEO001"))?.videos[0];
  expect(video).toMatchObject({
    title: "Product tour",
    status: "Script & storyboard",
  });
  expect(vi.mocked(sendCustomerEmail)).toHaveBeenCalledOnce();
  expect(vi.mocked(sendCustomerEmail).mock.calls[0][0].html).toContain(
    "Product tour",
  );
});

test("a new title replaces the old one", async () => {
  await updateVideo("SB-VIDEO001", 1, {
    title: "Onboarding",
    status: "Script & storyboard",
  });
  expect((await getPortalOrder("SB-VIDEO001"))?.videos[0].title).toBe(
    "Onboarding",
  );
});
