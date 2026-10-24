import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed link keys for the client portal and the concept review pages.
 *
 * No passwords: a link carries an HMAC of what it grants (e.g. "team|SB-…"),
 * so it can't be guessed or edited. The key comes from PORTAL_SECRET, or is
 * derived from STRIPE_SECRET_KEY / SMTP_PASS. Rotating it revokes every link.
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

/** The studio's master key: opens every order and concept request as the team. */
export const isAdminKey = (key?: string) => keyMatches(key, "admin");
