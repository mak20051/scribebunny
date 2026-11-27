import { expect, test } from "vitest";
import {
  claimJson,
  listPaths,
  readJson,
  storeConfigured,
  updateJson,
  writeJson,
} from "@/lib/store";

test("tests use the in-memory store", () => {
  expect(storeConfigured).toBe(false);
});

test("onlyIfNew writes once", async () => {
  expect(await writeJson("orders/A.json", { n: 1 }, { onlyIfNew: true })).toBe(
    true,
  );
  expect(await writeJson("orders/A.json", { n: 2 }, { onlyIfNew: true })).toBe(
    false,
  );
  expect((await readJson<{ n: number }>("orders/A.json"))?.value.n).toBe(1);
});

test("a write with a stale etag is refused", async () => {
  await writeJson("orders/B.json", { n: 1 });
  const first = await readJson<{ n: number }>("orders/B.json");
  await writeJson("orders/B.json", { n: 2 });
  expect(
    await writeJson("orders/B.json", { n: 3 }, { etag: first!.etag }),
  ).toBe(false);
  expect((await readJson<{ n: number }>("orders/B.json"))?.value.n).toBe(2);
});

test("concurrent updates both land", async () => {
  await writeJson("orders/C.json", { items: [] as number[] });
  await Promise.all(
    [1, 2, 3, 4].map((n) =>
      updateJson<{ items: number[] }>("orders/C.json", (value) => {
        value.items.push(n);
      }),
    ),
  );
  const items = (await readJson<{ items: number[] }>("orders/C.json"))?.value
    .items;
  expect(items?.slice().sort()).toEqual([1, 2, 3, 4]);
});

test("updating a missing document fails", async () => {
  await expect(
    updateJson("orders/missing.json", () => undefined),
  ).rejects.toThrow();
});

test("listPaths lists one folder", async () => {
  await writeJson("leads/L-1.json", {});
  expect(await listPaths("leads/")).toEqual(["leads/L-1.json"]);
});

test("claimJson: of two claims at once, exactly one wins", async () => {
  await writeJson("orders/D.json", { paid: false });
  const claim = () =>
    claimJson<{ paid: boolean }>("orders/D.json", (value) => {
      if (value.paid) return false;
      value.paid = true;
      return true;
    });
  const results = await Promise.all([claim(), claim(), claim()]);
  expect(results.filter(Boolean)).toHaveLength(1);
  expect(await claim()).toBeNull();
});
