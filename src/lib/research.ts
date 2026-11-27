import { lookup } from "node:dns";
import { BlockList, isIP, type LookupFunction } from "node:net";
import { Agent, fetch } from "undici";

/**
 * Reads a prospect's website so concepts can be grounded in it.
 *
 *   url ─▶ public-host check ─▶ fetch (redirects re-checked, 10s, 1.5MB cap)
 *       ─▶ title, description, headings, visible text (capped at ~8k chars)
 *
 * The URL comes from a public form, so every connection's address is checked
 * against private, loopback, link-local and IPv4-embedding ranges as it opens
 * (no SSRF into internal networks, even when DNS answers change).
 */

export type WebsiteResearch = {
  url: string;
  title?: string;
  description?: string;
  headings: string[];
  text: string;
};

const MAX_BYTES = 1_500_000;
const MAX_TEXT = 8_000;
const MAX_REDIRECTS = 3;

const PRIVATE = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
  ["224.0.0.0", 3],
] as const) {
  PRIVATE.addSubnet(network, prefix, "ipv4");
}
for (const [network, prefix] of [
  ["::", 96],
  ["64:ff9b::", 96],
  ["64:ff9b:1::", 48],
  ["2002::", 16],
  ["fc00::", 7],
  ["fe80::", 10],
  ["fec0::", 10],
  ["ff00::", 8],
] as const) {
  PRIVATE.addSubnet(network, prefix, "ipv6");
}

const isPrivateAddress = (address: string) =>
  PRIVATE.check(address, isIP(address) === 6 ? "ipv6" : "ipv4");

class NotPublicError extends Error {
  constructor() {
    super("Not a public website");
  }
}

const publicLookup: LookupFunction = (hostname, options, callback) =>
  lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error, []);
    if (addresses.some(({ address }) => isPrivateAddress(address))) {
      return callback(new NotPublicError(), []);
    }
    if (options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });

const publicAgent = new Agent({ connect: { lookup: publicLookup } });

function assertPublic(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https websites can be read");
  }
  if (
    !url.hostname.includes(".") ||
    url.hostname.endsWith(".local") ||
    (isIP(url.hostname) && isPrivateAddress(url.hostname))
  ) {
    throw new NotPublicError();
  }
}

export function normalizeWebsite(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
  } catch {
    return null;
  }
}

async function fetchPublic(start: URL) {
  let url = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    assertPublic(url);
    const response = await fetch(url, {
      dispatcher: publicAgent,
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ScribebunnyConcepts/1.0; +https://scribebunny.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    }).catch((error: unknown) => {
      throw error instanceof TypeError && error.cause instanceof NotPublicError
        ? error.cause
        : error;
    });
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) throw new Error(`Website answered ${response.status}`);
    const reader = response.body?.getReader();
    if (!reader) return { url, html: "" };
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (size < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.length;
    }
    await reader.cancel().catch(() => {});
    return { url, html: Buffer.concat(chunks).toString("utf8") };
  }
  throw new Error("Too many redirects");
}

const decode = (text: string) =>
  text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

const clean = (text: string) => decode(text).replace(/\s+/g, " ").trim();

function meta(html: string, name: string) {
  const match =
    html.match(
      new RegExp(
        `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
        "i",
      ),
    ) ??
    html.match(
      new RegExp(
        `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`,
        "i",
      ),
    );
  return match ? clean(match[1]) : undefined;
}

export async function researchWebsite(raw: string): Promise<WebsiteResearch> {
  const start = normalizeWebsite(raw);
  if (!start) throw new Error("That doesn't look like a website address");
  const { url, html } = await fetchPublic(start);

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map((match) => clean(match[1].replace(/<[^>]+>/g, " ")))
    .filter((heading) => heading.length > 2)
    .slice(0, 25);
  const body = html
    .replace(
      /<(script|style|noscript|svg|template|iframe)[\s\S]*?<\/\1>/gi,
      " ",
    )
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ");

  return {
    url: url.toString(),
    title: title ? clean(title) : undefined,
    description: meta(html, "description") ?? meta(html, "og:description"),
    headings,
    text: clean(body).slice(0, MAX_TEXT),
  };
}
