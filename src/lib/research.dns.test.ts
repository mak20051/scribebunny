import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, expect, test, vi } from "vitest";
import { researchWebsite } from "@/lib/research";

const answers = vi.hoisted(() => ({ checked: "", connect: "" }));
const familyOf = (address: string) => (address.includes(":") ? 6 : 4);

vi.mock("node:dns/promises", async (importOriginal) => ({
  ...(await importOriginal<typeof import("node:dns/promises")>()),
  lookup: async () => [
    { address: answers.checked, family: familyOf(answers.checked) },
  ],
}));

vi.mock("node:dns", async (importOriginal) => {
  const dns = await importOriginal<typeof import("node:dns")>();
  const lookup = (
    _host: string,
    options: { all?: boolean },
    callback: (...args: unknown[]) => void,
  ) => {
    const address = answers.connect;
    return options.all
      ? callback(null, [{ address, family: familyOf(address) }])
      : callback(null, address, familyOf(address));
  };
  return { ...dns, default: { ...dns, lookup }, lookup };
});

let requests = 0;
const server = createServer((_request, response) => {
  requests++;
  response.end("<title>Internal admin</title>");
});

beforeAll(() => new Promise<void>((resolve) => server.listen(0, resolve)));
afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

test("a name that turns private when we connect is refused", async () => {
  Object.assign(answers, { checked: "93.184.215.14", connect: "127.0.0.1" });
  const { port } = server.address() as AddressInfo;
  await expect(researchWebsite(`http://localhost.:${port}/`)).rejects.toThrow(
    "Not a public website",
  );
  expect(requests).toBe(0);
});

test.each([
  "127.0.0.1",
  "10.1.2.3",
  "::1",
  "::ffff:7f00:1",
  "::127.0.0.1",
  "64:ff9b::7f00:1",
  "fd00::1",
  "fe90::1",
  "fec0::1",
  "ff02::1",
  "2002:7f00:1::1",
])("a name that resolves to %s is refused", async (address) => {
  Object.assign(answers, { checked: address, connect: address });
  await expect(researchWebsite("http://site.example/")).rejects.toThrow(
    "Not a public website",
  );
});
