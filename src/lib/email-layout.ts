import {
  ADDRESS,
  LOGO_URL,
  PARENT_COMPANY,
  PHONE_DISPLAY,
  SITE_URL,
  TAGLINE,
} from "@/lib/site";

/**
 * Email layouts: one hand-drawn look for everything Scribebunny sends.
 *
 *   brandedEmail() → customers: order confirmations
 *   alertEmail()   → the team: new leads, paid orders
 *
 * Email-client rules: table layout, inline styles only, 600px max width,
 * web-safe fonts, a button that works without images, a hidden preheader for
 * the inbox preview, and a logo that degrades to alt text when images are off.
 */

const BRAND = {
  ink: "#2D3748",
  body: "#4A5568",
  muted: "#718096",
  line: "#E2E8F0",
  canvas: "#FFF9F0",
  red: "#FF3333",
  yellow: "#FFE66D",
  font: "'Helvetica Neue',Helvetica,Arial,sans-serif",
};

export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

const preheaderHtml = (text?: string) =>
  text
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${escapeHtml(text)}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>`
    : "";

function button(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${BRAND.red}" style="border:3px solid ${BRAND.ink};border-radius:14px">
    <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:${BRAND.font};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none">${escapeHtml(label)} &rarr;</a>
  </td></tr></table>`;
}

function shell(inner: string, preheader?: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title></title></head>
<body style="margin:0;padding:0;background:${BRAND.canvas};-webkit-text-size-adjust:100%">
${preheaderHtml(preheader)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.canvas}"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">
${inner}
</table></td></tr></table></body></html>`;
}

/** A two-column summary table, e.g. the order details. Values are escaped here. */
export function detailsTable(rows: [string, string | undefined][]) {
  const filled = rows.filter(([, v]) => v && v.trim());
  const valueHtml = (v: string) => {
    const t = escapeHtml(v);
    if (/^https?:\/\/\S+$/.test(v))
      return `<a href="${t}" style="color:${BRAND.red};word-break:break-all">${t}</a>`;
    if (/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v))
      return `<a href="mailto:${t}" style="color:${BRAND.red}">${t}</a>`;
    return t.replace(/\n/g, "<br>");
  };
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid ${BRAND.ink};border-radius:12px;border-collapse:separate;margin:0 0 20px">${filled
    .map(
      ([k, v], i) => `<tr>
      <td valign="top" style="padding:11px 16px;width:140px;font-family:${BRAND.font};font-size:12px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:${BRAND.muted};${i ? `border-top:1px solid ${BRAND.line};` : ""}">${escapeHtml(k)}</td>
      <td valign="top" style="padding:11px 16px;font-family:${BRAND.font};font-size:15px;line-height:1.55;color:${BRAND.ink};${i ? `border-top:1px solid ${BRAND.line};` : ""}">${valueHtml(v!)}</td>
    </tr>`,
    )
    .join("")}</table>`;
}

/** A reminder's opt-out line: why they get it, and the link that stops it. */
export type StopLink = { reason: string; href: string };

const footer = (stop?: StopLink) => `<tr><td style="padding:22px 32px 0;text-align:center;font-family:${BRAND.font};font-size:12px;line-height:1.7;color:${BRAND.muted}">
  <a href="${SITE_URL}/work" style="color:${BRAND.muted};text-decoration:underline">Our work</a> &nbsp;·&nbsp;
  <a href="${SITE_URL}/#pricing" style="color:${BRAND.muted};text-decoration:underline">Pricing</a> &nbsp;·&nbsp;
  <a href="${SITE_URL}/contact" style="color:${BRAND.muted};text-decoration:underline">Contact</a><br>
  Scribebunny is a brand of ${escapeHtml(PARENT_COMPANY)} · ${escapeHtml(`${ADDRESS.street}, ${ADDRESS.city}, ${ADDRESS.region} ${ADDRESS.postalCode}`)} · ${escapeHtml(PHONE_DISPLAY)}${
    stop
      ? `<br>${escapeHtml(stop.reason)} <a href="${escapeHtml(stop.href)}" style="color:${BRAND.muted};text-decoration:underline">Stop these reminders</a>`
      : ""
  }
</td></tr>`;

/**
 * Customer-facing email. `bodyHtml` must already be escaped (use escapeHtml for
 * anything a person typed). <p> tags are styled automatically.
 */
export function brandedEmail(opts: {
  heading: string;
  bodyHtml: string;
  preheader?: string;
  eyebrow?: string;
  button?: { label: string; href: string };
  afterButton?: string;
  stopLink?: StopLink;
}) {
  const body = opts.bodyHtml.replace(
    /<p>/g,
    `<p style="margin:0 0 16px;font-family:${BRAND.font};font-size:16px;line-height:1.65;color:${BRAND.body}">`,
  );
  return shell(
    `
<tr><td style="background:#ffffff;border:3px solid ${BRAND.ink};border-bottom:0;border-radius:18px 18px 0 0;padding:22px 32px">
  <a href="${SITE_URL}" style="text-decoration:none"><img src="${LOGO_URL}" width="200" height="55" alt="Scribebunny animation studio" style="display:block;border:0;color:${BRAND.red};font-family:${BRAND.font};font-size:20px;font-weight:700"></a>
</td></tr>
<tr><td style="height:8px;background:${BRAND.yellow};border-left:3px solid ${BRAND.ink};border-right:3px solid ${BRAND.ink};font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="background:#ffffff;border-left:3px solid ${BRAND.ink};border-right:3px solid ${BRAND.ink};padding:32px 32px 8px">
  ${opts.eyebrow ? `<p style="margin:0 0 10px;font-family:${BRAND.font};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND.red}">${escapeHtml(opts.eyebrow)}</p>` : ""}
  <h1 style="margin:0 0 20px;font-family:${BRAND.font};font-size:28px;line-height:1.2;font-weight:800;color:${BRAND.ink}">${escapeHtml(opts.heading)}</h1>
  ${body}
</td></tr>
${
  opts.button
    ? `<tr><td style="background:#ffffff;border-left:3px solid ${BRAND.ink};border-right:3px solid ${BRAND.ink};padding:8px 32px">${button(opts.button.label, opts.button.href)}
  ${opts.afterButton ? `<p style="margin:14px 0 0;font-family:${BRAND.font};font-size:14px;color:${BRAND.muted}">${escapeHtml(opts.afterButton)}</p>` : ""}</td></tr>`
    : ""
}
<tr><td style="background:#ffffff;border:3px solid ${BRAND.ink};border-top:0;border-radius:0 0 18px 18px;padding:24px 32px 30px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:2px dashed ${BRAND.line};padding-top:20px;font-family:${BRAND.font};font-size:15px;line-height:1.6;color:${BRAND.body}">
    <strong style="color:${BRAND.ink}">The Scribebunny studio</strong><br>
    ${escapeHtml(TAGLINE)} Questions? Just reply to this email.
  </td></tr></table>
</td></tr>
${footer(opts.stopLink)}`,
    opts.preheader,
  );
}

export type AlertTone = "lead" | "paid";

const TONE: Record<
  AlertTone,
  { color: string; soft: string; label: string; note: string }
> = {
  lead: {
    color: BRAND.red,
    soft: "#FFE5E5",
    label: "New lead",
    note: "Reply within 24 hours, as the site promises.",
  },
  paid: {
    color: "#17734A",
    soft: "#E3F3EA",
    label: "Payment received",
    note: "Money is in. Reply to the client within 24 hours to collect their brief.",
  },
};

/** Internal alert: what happened, every detail, and one-click next steps. */
export function alertEmail(opts: {
  title: string;
  fields: [string, string | undefined][];
  tone: AlertTone;
  /** The main next step, shown as the first button. */
  link?: { label: string; href: string };
}) {
  const tone = TONE[opts.tone];
  const email = opts.fields.find(([k]) => k.toLowerCase() === "email")?.[1];
  const phone = opts.fields.find(([k]) => k.toLowerCase() === "phone")?.[1];
  const actions = [
    opts.link && button(opts.link.label, opts.link.href),
    email && button(`Reply to ${email.split("@")[0]}`, `mailto:${email}`),
    phone &&
      `<a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}" style="font-family:${BRAND.font};font-size:15px;color:${BRAND.ink};text-decoration:underline">Call ${escapeHtml(phone)}</a>`,
  ].filter(Boolean);

  return shell(
    `
<tr><td style="background:#ffffff;border:3px solid ${BRAND.ink};border-radius:18px;border-top:8px solid ${tone.color};padding:26px 28px 8px">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${tone.soft};border-radius:999px;padding:5px 12px;font-family:${BRAND.font};font-size:12px;font-weight:700;color:${tone.color}">${tone.label}</td>
  <td style="padding-left:10px;font-family:${BRAND.font};font-size:12px;color:${BRAND.muted}">scribebunny.com</td></tr></table>
  <h1 style="margin:14px 0 6px;font-family:${BRAND.font};font-size:22px;line-height:1.3;font-weight:800;color:${BRAND.ink}">${escapeHtml(opts.title)}</h1>
  <p style="margin:0 0 18px;font-family:${BRAND.font};font-size:14px;color:${BRAND.muted}">${escapeHtml(tone.note)}</p>
  ${detailsTable(opts.fields)}
  ${actions.length ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 22px"><tr>${actions.map((a) => `<td style="padding-right:16px" valign="middle">${a}</td>`).join("")}</tr></table>` : ""}
</td></tr>
${footer()}`,
    `${tone.label}: ${opts.title}`,
  );
}

/** Plain-text twin of an alert, for clients that block HTML. */
export function alertText(
  title: string,
  fields: [string, string | undefined][],
) {
  return `${title}\n\n${fields
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")}`;
}
