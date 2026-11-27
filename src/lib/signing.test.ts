import { expect, test } from "vitest";
import { keyMatches, sign } from "@/lib/signing";
import { newKey, sameKey } from "@/lib/access";

test("a signed link key matches only its own subject", () => {
  const key = sign("client|SB-AAAA1111");
  expect(key).toHaveLength(32);
  expect(keyMatches(key, "client|SB-AAAA1111")).toBe(true);
  expect(keyMatches(key, "client|SB-BBBB2222")).toBe(false);
  expect(keyMatches(key.slice(1), "client|SB-AAAA1111")).toBe(false);
  expect(keyMatches(undefined, "client|SB-AAAA1111")).toBe(false);
});

test("random keys are long, URL-safe and unique", () => {
  const keys = new Set(Array.from({ length: 50 }, newKey));
  expect(keys.size).toBe(50);
  for (const key of keys) expect(key).toMatch(/^[\w-]{32}$/);
});

test("sameKey needs both keys and an exact match", () => {
  const key = newKey();
  expect(sameKey(key, key)).toBe(true);
  expect(sameKey(key, newKey())).toBe(false);
  expect(sameKey(key.slice(0, -1), key)).toBe(false);
  expect(sameKey("", key)).toBe(false);
  expect(sameKey(key, undefined)).toBe(false);
});
