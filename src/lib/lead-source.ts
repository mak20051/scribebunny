/**
 * Where a lead came from: channel, source, campaign, landing page, the page
 * the form was sent from, rough location and device.
 *
 *   browser (components/lead-source-tracker.tsx)       server (this file)
 *   ┌─────────────────────────────────────────┐        ┌──────────────────────────────┐
 *   │ each visit: utm_*, click ID, referrer   │  form  │ clean the browser's touches  │
 *   │ host, landing path -> localStorage      │ ─────▶ │ name the channel             │
 *   │ first touch + last non-direct touch     │  body  │ + Vercel geo headers (city,  │
 *   │ (90 days)                               │        │   region, country), device   │
 *   └─────────────────────────────────────────┘        └──────────────┬───────────────┘
 *                                                                     ▼
 *              lead record, concept request, Stripe metadata -> order, team alert,
 *              CRM message, growth board
 *
 * The IP address is never stored. Leads sent before this shipped have no source.
 */

export const CHANNELS = [
  "Paid search",
  "Paid social",
  "Paid other",
  "Organic search",
  "Organic social",
  "AI assistant",
  "Email",
  "Referral",
  "Other campaign",
  "Direct",
  "Unknown",
] as const;

export type Channel = (typeof CHANNELS)[number];

export type LeadSource = {
  channel: Channel;
  /** utm_source, else the referring site, else the ad network; "(direct)" if none. */
  source: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  /** Page they landed on from that source. */
  landing?: string;
  /** Page the form was sent from. */
  page?: string;
  /** Their very first visit, when it differs from the one above. */
  first?: { channel: Channel; source: string; landing?: string; at?: string };
  city?: string;
  region?: string;
  country?: string;
  device?: "Mobile" | "Tablet" | "Desktop";
};

export const CLICK_IDS = [
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "fbclid",
  "ttclid",
  "li_fat_id",
] as const;

type ClickId = (typeof CLICK_IDS)[number];

const CLICK_SOURCE: Record<ClickId, string> = {
  gclid: "google",
  gbraid: "google",
  wbraid: "google",
  msclkid: "bing",
  fbclid: "facebook",
  ttclid: "tiktok",
  li_fat_id: "linkedin",
};

type Touch = {
  at?: string;
  landing?: string;
  referrer?: string;
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  click?: ClickId;
};

const text = (value: unknown, max = 150) =>
  typeof value === "string"
    ? value.trim().slice(0, max) || undefined
    : undefined;

const pathOnly = (value: unknown) => {
  const path = text(value, 200)?.split(/[?#]/)[0];
  return path?.startsWith("/") && !path.startsWith("//") ? path : undefined;
};

const hostOnly = (value: unknown) => {
  const host = text(value, 120)?.toLowerCase();
  return host && /^[a-z0-9.-]+$/.test(host) ? host : undefined;
};

const isoOnly = (value: unknown) => {
  const iso = text(value, 40);
  return iso && !Number.isNaN(Date.parse(iso)) ? iso : undefined;
};

function readTouch(raw: unknown): Touch | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const touch = raw as Record<string, unknown>;
  const utm =
    touch.utm && typeof touch.utm === "object"
      ? (touch.utm as Record<string, unknown>)
      : {};
  return {
    at: isoOnly(touch.at),
    landing: pathOnly(touch.landing),
    referrer: hostOnly(touch.referrer),
    utm: {
      source: text(utm.source)?.toLowerCase(),
      medium: text(utm.medium)?.toLowerCase(),
      campaign: text(utm.campaign),
      term: text(utm.term),
      content: text(utm.content),
    },
    click: CLICK_IDS.find((id) => id === touch.click),
  };
}

/** "google" matches google, google.com, www.google.co.uk, lm.google.com... */
const named = (source: string, names: string[]) =>
  names.some(
    (name) =>
      source === name ||
      source.startsWith(`${name}.`) ||
      source.includes(`.${name}.`) ||
      source.endsWith(`.${name}`),
  );

const AI = [
  "chatgpt",
  "openai",
  "perplexity",
  "claude",
  "gemini",
  "copilot",
  "deepseek",
];
const SEARCH = [
  "google",
  "bing",
  "duckduckgo",
  "yahoo",
  "ecosia",
  "yandex",
  "baidu",
  "brave",
  "startpage",
  "qwant",
];
const SOCIAL = [
  "facebook",
  "instagram",
  "linkedin",
  "twitter",
  "tiktok",
  "youtube",
  "reddit",
  "pinterest",
  "quora",
  "threads",
  "whatsapp",
  "telegram",
];
const SOCIAL_EXACT = [
  "fb",
  "ig",
  "x",
  "x.com",
  "t.co",
  "lnkd.in",
  "youtu.be",
  "fb.me",
  "t.me",
];
const PAID_MEDIUM =
  /^(cpc|ppc|cpm|cpv|cpa|paid.*|ads?|.*[-_ ]ads?|display|banner|retargeting)$/;

function describe(touch: Touch) {
  const { utm, click } = touch;
  const source =
    utm.source ??
    touch.referrer?.replace(/^www\./, "") ??
    (click ? CLICK_SOURCE[click] : undefined) ??
    "(direct)";
  const medium = utm.medium ?? "";
  // Webmail first: mail.google.com is Gmail, not Google search.
  const kind = /^(mail|webmail)\.|(^|\.)outlook\.|webmail/.test(source)
    ? "email"
    : named(source, AI)
      ? "ai"
      : named(source, SEARCH)
        ? "search"
        : named(source, SOCIAL) || SOCIAL_EXACT.includes(source)
          ? "social"
          : null;
  const paidClick = click && click !== "fbclid";

  let channel: Channel;
  if (
    /e-?mail|newsletter/.test(medium) ||
    ["email", "newsletter"].includes(source)
  ) {
    channel = "Email";
  } else if (PAID_MEDIUM.test(medium) || paidClick) {
    channel =
      kind === "social" || click === "ttclid" || click === "li_fat_id"
        ? "Paid social"
        : kind === "search" || paidClick
          ? "Paid search"
          : "Paid other";
  } else if (kind === "ai") {
    channel = "AI assistant";
  } else if (kind === "search" || medium === "organic") {
    channel = "Organic search";
  } else if (kind === "social" || /social/.test(medium) || click === "fbclid") {
    channel = "Organic social";
  } else if (kind === "email") {
    channel = "Email";
  } else if (utm.source || utm.medium || utm.campaign) {
    channel = "Other campaign";
  } else if (touch.referrer) {
    channel = "Referral";
  } else {
    channel = "Direct";
  }
  return { channel, source, medium: utm.medium };
}

function countryName(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function deviceOf(userAgent: string): LeadSource["device"] {
  if (!userAgent) return undefined;
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(userAgent)) {
    return "Tablet";
  }
  return /Mobi|iPhone|iPod|Android/i.test(userAgent) ? "Mobile" : "Desktop";
}

/**
 * The source of a form sent to the site: the browser's touches (sent with
 * the form) plus Vercel's location headers and the user agent.
 */
export function leadSource(request: Request, browser: unknown): LeadSource {
  const raw =
    browser && typeof browser === "object"
      ? (browser as Record<string, unknown>)
      : {};
  const last = readTouch(raw.last);
  const first = readTouch(raw.first);
  const headers = request.headers;

  const lastSeen = last ? describe(last) : null;
  const firstSeen = first ? describe(first) : null;
  const sameTouch =
    !first ||
    !last ||
    (first.at === last.at && first.landing === last.landing) ||
    (firstSeen?.channel === lastSeen?.channel &&
      firstSeen?.source === lastSeen?.source &&
      first.landing === last.landing);

  let city = headers.get("x-vercel-ip-city") ?? undefined;
  try {
    city = city ? decodeURIComponent(city) : undefined;
  } catch {
    // Keep it as sent.
  }
  const country = headers.get("x-vercel-ip-country");

  return {
    channel: lastSeen?.channel ?? "Unknown",
    source: lastSeen?.source ?? "(not recorded)",
    medium: lastSeen?.medium,
    campaign: last?.utm.campaign,
    term: last?.utm.term,
    content: last?.utm.content,
    landing: last?.landing,
    page: pathOnly(raw.page),
    first:
      first && firstSeen && !sameTouch
        ? {
            channel: firstSeen.channel,
            source: firstSeen.source,
            landing: first.landing,
            at: first.at,
          }
        : undefined,
    city: text(city, 80),
    region: text(headers.get("x-vercel-ip-country-region"), 10),
    country: country ? countryName(text(country, 4) ?? country) : undefined,
    device: deviceOf(headers.get("user-agent") ?? ""),
  };
}

const sourceLabel = (channel: Channel, source: string, medium?: string) =>
  source.startsWith("(")
    ? channel
    : `${channel} · ${source}${medium ? ` / ${medium}` : ""}`;

export const placeOf = (source?: LeadSource) =>
  [source?.city, source?.region, source?.country].filter(Boolean).join(", ") ||
  undefined;

const dayOf = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        timeZone: "America/Phoenix",
        dateStyle: "medium",
      })
    : undefined;

/** Rows for team alerts and studio pages. */
export function sourceFields(
  source?: LeadSource,
): [string, string | undefined][] {
  if (!source) return [];
  const first = source.first;
  return [
    ["Channel", sourceLabel(source.channel, source.source, source.medium)],
    [
      "Campaign",
      [
        source.campaign,
        source.term && `keyword: ${source.term}`,
        source.content && `ad: ${source.content}`,
      ]
        .filter(Boolean)
        .join(" · ") || undefined,
    ],
    ["Landing page", source.landing],
    ["Form page", source.page],
    [
      "First visit",
      first
        ? [
            sourceLabel(first.channel, first.source),
            dayOf(first.at),
            first.landing && `landed on ${first.landing}`,
          ]
            .filter(Boolean)
            .join(" · ")
        : undefined,
    ],
    ["Location", placeOf(source)],
    ["Device", source.device],
  ];
}

/** One line for the CRM message. */
export const sourceSummary = (source: LeadSource) =>
  `Source: ${sourceFields(source)
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("; ")}`;

/** Stripe metadata (flat strings) so a paid order keeps its source. */
export function sourceMetadata(source: LeadSource): Record<string, string> {
  const values: Record<string, string | undefined> = {
    src_channel: source.channel,
    src_source: source.source,
    src_medium: source.medium,
    src_campaign: source.campaign,
    src_term: source.term,
    src_content: source.content,
    src_landing: source.landing,
    src_page: source.page,
    src_first_channel: source.first?.channel,
    src_first_source: source.first?.source,
    src_first_landing: source.first?.landing,
    src_first_at: source.first?.at,
    src_city: source.city,
    src_region: source.region,
    src_country: source.country,
    src_device: source.device,
  };
  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  );
}

const asChannel = (value?: string): Channel =>
  CHANNELS.find((channel) => channel === value) ?? "Unknown";

export function sourceFromMetadata(
  metadata?: Record<string, string> | null,
): LeadSource | undefined {
  if (!metadata?.src_channel) return undefined;
  const m = metadata;
  return {
    channel: asChannel(m.src_channel),
    source: m.src_source ?? "(not recorded)",
    medium: m.src_medium,
    campaign: m.src_campaign,
    term: m.src_term,
    content: m.src_content,
    landing: m.src_landing,
    page: m.src_page,
    first: m.src_first_channel
      ? {
          channel: asChannel(m.src_first_channel),
          source: m.src_first_source ?? "",
          landing: m.src_first_landing,
          at: m.src_first_at,
        }
      : undefined,
    city: m.src_city,
    region: m.src_region,
    country: m.src_country,
    device: (["Mobile", "Tablet", "Desktop"] as const).find(
      (device) => device === m.src_device,
    ),
  };
}
