import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed (HMAC) link keys, kept only for client links on orders opened before
 * 2026-10-25. New links use random keys (lib/access.ts, PortalOrder.clientKey).
 *
 * The key comes from PORTAL_SECRET, or is derived from STRIPE_SECRET_KEY /
 * SMTP_PASS. Rotating it only affects those older client links.
 */

function secret(): Buffer {
  const base =
    process.env.PORTAL_SECRET ||
    process.env.STRIPE_SECRET_KEY ||
    process.env.SMTP_PASS;
  if (!base) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("No secret available to sign links");
    }
    return createHash("sha256").update("sb-portal-v1|local-dev-only").digest();
  }
  return createHash("sha256").update(`sb-portal-v1|${base}`).digest();
}

export function sign(subject: string) {
  return createHmac("sha256", secret())
    .update(subject)
    .digest("base64url")
    .slice(0, 32);
}

export function keyMatches(key: string | undefined, subject: string) {
  if (!key) return false;
  const expected = Buffer.from(sign(subject));
  const given = Buffer.from(key);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
