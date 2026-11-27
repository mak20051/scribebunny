import { describe, expect, test, vi } from "vitest";
import { POST } from "@/app/api/leads/route";
import { growthReport } from "@/lib/growth";
import { listLeads } from "@/lib/leads";

vi.mock("@/lib/email", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/email")>()),
  sendTeamEmail: vi.fn(async () => undefined),
  sendCustomerEmail: vi.fn(async () => undefined),
}));
vi.mock("@/lib/crm", () => ({ forwardToCrm: vi.fn(async () => undefined) }));

const post = (body: unknown) =>
  POST(
    new Request("https://scribebunny.com/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

describe("POST /api/leads", () => {
  test("stores a normal lead", async () => {
    const response = await post({
      type: "strategy",
      subject: "Lead from Ada",
      fields: {
        Name: "Ada",
        Email: "ada@example.com",
        Brief: "Explain our app",
      },
    });
    expect(response.status).toBe(200);
    expect((await listLeads()).map((lead) => lead.email)).toContain(
      "ada@example.com",
    );
  });

  test("non-text fields are not stored and cannot break the growth board", async () => {
    const response = await post({
      type: "x",
      subject: "x",
      fields: { Name: { evil: true }, Email: 0, Phone: false },
    });
    expect(response.status).toBe(200);
    for (const lead of await listLeads()) {
      expect(typeof lead.email).toBe("string");
      expect(typeof lead.name).toBe("string");
    }
    await expect(growthReport("all")).resolves.toBeDefined();
  });

  test.each([null, "text", { fields: "text" }, { fields: [] }])(
    "rejects a body without a fields object: %j",
    async (body) => {
      expect((await post(body)).status).toBe(400);
    },
  );
});
