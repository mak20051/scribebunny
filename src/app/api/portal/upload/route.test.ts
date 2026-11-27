import { beforeAll, expect, test } from "vitest";
import { POST } from "@/app/api/portal/upload/route";
import { DEMO_MAX_FILES } from "@/lib/attachments";
import { DEMO_REF, getPortalOrder } from "@/lib/portal";

let key = "";

beforeAll(async () => {
  key = (await getPortalOrder(DEMO_REF))?.clientKey ?? "";
});

const upload = async () => {
  const form = new FormData();
  form.set("ref", DEMO_REF);
  form.set("k", key);
  form.set(
    "file",
    new File([new Uint8Array(8)], "sketch.png", { type: "image/png" }),
  );
  const response = await POST(
    new Request("https://scribebunny.com/api/portal/upload", {
      method: "POST",
      body: form,
    }),
  );
  return { status: response.status, body: await response.json() };
};

test("the demo stops taking files at its limit, even ones never posted", async () => {
  for (let count = 0; count < DEMO_MAX_FILES; count++) {
    expect((await upload()).status).toBe(200);
  }
  expect(await upload()).toEqual({
    status: 400,
    body: { error: "The demo is full of files. Ask the team to reset it." },
  });
});
