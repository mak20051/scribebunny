/**
 * Message attachments: screenshots and files in portal messages.
 *
 *   browser ─upload─▶ portal/files/<ref>/<name>-<random>     app/api/portal/upload
 *   message  { attachments: [{ path, name, size, contentType }] }
 *   viewing  /portal/<ref>/file?k=<key>&p=<path>             app/portal/[ref]/file
 *
 * Only people with a key to the order can upload into it or open its files.
 * The demo takes small images and PDFs only, and Reset demo deletes them.
 * Safe for the browser bundle: no server imports.
 */

export type Attachment = {
  /** Path in the portal store, always under files/<ref>/. */
  path: string;
  name: string;
  size: number;
  contentType: string;
};

export const MAX_FILES_PER_MESSAGE = 10;
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const DEMO_MAX_FILE_BYTES = 5 * 1024 * 1024;
export const DEMO_MAX_FILES = 30;

/** Opened in the browser; every other type downloads. */
export const INLINE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
];

export const DEMO_TYPES = INLINE_TYPES;

export const ALLOWED_TYPES = [
  ...INLINE_TYPES,
  "image/heic",
  "image/heif",
  "image/svg+xml",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/postscript",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "video/mp4",
  "video/quicktime",
];

export const isPreviewImage = (contentType: string) =>
  contentType.startsWith("image/") && INLINE_TYPES.includes(contentType);

export const filesFolder = (ref: string) => `files/${ref}/`;

/** Where a browser uploads a file in the store ("portal/" is the store root, lib/store.ts). */
export const uploadPathname = (ref: string, name: string) =>
  `portal/${filesFolder(ref)}${safeFileName(name)}`;

export function safeFileName(name: string) {
  const clean = name
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/^[-.]+/, "")
    .slice(-80);
  return clean || "file";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}
