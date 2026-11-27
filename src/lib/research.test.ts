import { describe, expect, test } from "vitest";
import { normalizeWebsite, researchWebsite } from "@/lib/research";

describe("normalizeWebsite", () => {
  test.each([
    ["acme.com", "https://acme.com/"],
    ["  http://acme.com/about ", "http://acme.com/about"],
    ["HTTPS://Acme.com", "https://acme.com/"],
  ])("%s -> %s", (raw, url) => {
    expect(normalizeWebsite(raw)?.toString()).toBe(url);
  });

  test.each(["", "   ", "http://"])("%j is not a website", (raw) => {
    expect(normalizeWebsite(raw)).toBeNull();
  });
});

describe("researchWebsite refuses private addresses", () => {
  test.each([
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://2130706433",
    "http://0x7f.1",
    "http://10.0.0.5",
    "http://172.16.0.1",
    "http://192.168.1.1",
    "http://169.254.169.254/latest/meta-data",
    "http://100.64.0.1",
    "http://0.0.0.0",
    "http://[::1]",
    "http://[::ffff:127.0.0.1]",
    "http://printer.local",
    "ftp://acme.com",
  ])("%s", async (raw) => {
    await expect(researchWebsite(raw)).rejects.toThrow();
  });
});
