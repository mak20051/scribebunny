import { expect, test } from "vitest";
import { formatBytes, safeFileName, uploadPathname } from "@/lib/attachments";

test.each([
  ["Brand Guide (final).pdf", "Brand-Guide-final.pdf"],
  ["../../etc/passwd", "etcpasswd"],
  ["..\\..\\secret.txt", "secret.txt"],
  ["résumé.pdf", "resume.pdf"],
  ["<script>.png", "script.png"],
  ["", "file"],
  ["....", "file"],
])("safeFileName(%j) = %j", (name, safe) => {
  expect(safeFileName(name)).toBe(safe);
});

test("long names keep their ending, so the extension survives", () => {
  const safe = safeFileName(`${"a".repeat(200)}.mp4`);
  expect(safe).toHaveLength(80);
  expect(safe.endsWith(".mp4")).toBe(true);
});

test("uploads stay inside the order's own folder", () => {
  expect(uploadPathname("SB-AAAA1111", "../../SB-BBBB2222/x.png")).toBe(
    "portal/files/SB-AAAA1111/SB-BBBB2222x.png",
  );
});

test.each([
  [512, "512 B"],
  [2048, "2 KB"],
  [5 * 1024 * 1024, "5.0 MB"],
  [50 * 1024 * 1024, "50 MB"],
])("formatBytes(%i) = %s", (bytes, text) => {
  expect(formatBytes(bytes)).toBe(text);
});
