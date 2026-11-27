import { describe, expect, test } from "vitest";
import {
  findVideoPackage,
  formatUsd,
  perVideoCents,
  savingsCents,
  videoPackages,
} from "@/lib/packages";

describe("packages", () => {
  test("prices and video counts", () => {
    expect(
      videoPackages.map(({ id, videos, priceCents }) => [
        id,
        videos,
        priceCents,
      ]),
    ).toEqual([
      ["single", 1, 29_900],
      ["five", 5, 119_900],
      ["ten", 10, 219_900],
    ]);
  });

  test("bigger packages cost less per video and save against singles", () => {
    const [single, five, ten] = videoPackages;
    expect(perVideoCents(single)).toBe(29_900);
    expect(perVideoCents(five)).toBe(23_980);
    expect(perVideoCents(ten)).toBe(21_990);
    expect(savingsCents(single)).toBe(0);
    expect(savingsCents(five)).toBe(29_600);
    expect(savingsCents(ten)).toBe(79_100);
  });

  test.each([undefined, null, "", "six", 5, {}])(
    "%s is not a package",
    (id) => {
      expect(findVideoPackage(id)).toBeUndefined();
    },
  );

  test("finds a package by id", () => {
    expect(findVideoPackage("five")?.videos).toBe(5);
  });

  test("formats cents as US dollars", () => {
    expect(formatUsd(119_900)).toBe("$1,199");
    expect(formatUsd(23_980)).toBe("$239.80");
  });
});
