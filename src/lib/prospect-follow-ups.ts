import { newKey, sameKey } from "@/lib/access";
import {
  firstName,
  getConceptRequest,
  listConceptRequests,
  updateConceptRequest,
  type ConceptRequest,
} from "@/lib/concepts";
import { sendCustomerEmail, unsubscribeHeaders } from "@/lib/email";
import { brandedEmail, detailsTable, escapeHtml } from "@/lib/email-layout";
import {
  findVideoPackage,
  formatUsd,
  perVideoCents,
  VIDEO_SPEC,
} from "@/lib/packages";
import {
  clientLink,
  emailClient,
  getPortalOrder,
  listPortalOrders,
  updateOrder,
  type PortalOrder,
} from "@/lib/portal";
import { CALENDLY_URL, PARENT_COMPANY, SITE_URL } from "@/lib/site";

/**
 * Follow-ups for prospects who haven't bought yet.
 *
 *   concepts sent ─────────┬─ day 2 ─▶ "Which story should we draw first?"
 *                          │           the 3 titles, the price, the 5-video upsell
 *                          └─ day 5 ─▶ "Your concepts are ready when you are"
 *                                      book a call; says it's the last reminder
 *   custom-price portal ───┬─ day 2 ─▶ "Your project is ready to start"  price, Pay button
 *   not paid yet (a quote) └─ day 5 ─▶ "Shall we start on your video?"  last reminder
 *
 * Sent by the daily cron (/api/cron/follow-ups), each at most once and only
 * within WINDOW_DAYS of its due day, so an old request never gets a late one.
 * They stop for good when:
 *   - the prospect orders: any portal with their email (a quote: once it's paid)
 *   - the prospect clicks "Stop these reminders" (/stop-reminders), or their
 *     mail app's unsubscribe button (/api/follow-ups/stop)
 *   - the team clicks "Stop follow-ups", after a reply or a booked call (neither
 *     is visible to the site)
 */

export type ProspectFollowUps = {
  day2?: string;
  day5?: string;
  stopped?: { at: string; by: "prospect" | "team"; email?: string };
  /** Random key in the prospect's "Stop these reminders" link. */
  stopKey?: string;
};

const STEPS = [
  { key: "day2", days: 2 },
  { key: "day5", days: 5 },
] as const;

type Step = (typeof STEPS)[number];

const WINDOW_DAYS = 3;
const DAY = 86_400_000;

/** Concept requests are C-XXXXXXXX, custom-price portals SB-XXXXXXXX. */
const ID = /^(C|SB)-[A-Z0-9]{8}$/;

const stopPage = (id: string, key: string) =>
  `${SITE_URL}/stop-reminders?id=${id}&k=${key}`;
const stopOneClick = (id: string, key: string) =>
  `${SITE_URL}/api/follow-ups/stop?id=${id}&k=${key}`;

/** A custom-price portal that is still waiting for the client to pay. */
const isOpenQuote = (order: PortalOrder) =>
  Boolean(
    order.manual &&
      !order.demo &&
      order.payment?.status === "awaiting" &&
      order.client.email,
  );

function dueStep(
  start: string,
  marks: ProspectFollowUps | undefined,
  now: number,
) {
  if (marks?.stopped) return null;
  const age = (now - Date.parse(start)) / DAY;
  return (
    [...STEPS]
      .reverse()
      .find(
        (step) =>
          age >= step.days &&
          age < step.days + WINDOW_DAYS &&
          !marks?.[step.key],
      ) ?? null
  );
}

type MarksChange = (marks?: ProspectFollowUps) => ProspectFollowUps | undefined;

/** Read and change a request's or a portal's follow-up marks, by its id. */
async function readMarks(id: string) {
  return id.startsWith("C-")
    ? (await getConceptRequest(id))?.followUps
    : (await getPortalOrder(id))?.payReminders;
}

async function updateMarks(id: string, change: MarksChange) {
  if (id.startsWith("C-")) {
    await updateConceptRequest(id, (current) => {
      current.followUps = change(current.followUps);
    });
  } else {
    await updateOrder(id, (current) => {
      current.payReminders = change(current.payReminders);
    });
  }
}

/**
 * Claim a step on the record, send it, and release the claim if sending fails:
 * running twice never sends twice, and a failure is tried again tomorrow. If
 * day 5 is due before day 2 went out, only day 5 is sent.
 */
async function sendStep(
  id: string,
  step: Step,
  now: number,
  send: (stopKey: string) => Promise<void>,
) {
  const at = new Date(now).toISOString();
  let stopKey = "";
  await updateMarks(id, (marks) => {
    if (marks?.stopped || marks?.[step.key]) return marks;
    stopKey = marks?.stopKey ?? newKey();
    const next: ProspectFollowUps = { ...marks, stopKey };
    for (const item of STEPS) {
      if (item.days <= step.days) next[item.key] ??= at;
    }
    return next;
  });
  if (!stopKey) return false;
  try {
    await send(stopKey);
    return true;
  } catch (error) {
    console.error(`[prospect follow-ups] ${id} ${step.key} failed:`, error);
    await updateMarks(id, (marks) => {
      if (!marks || marks[step.key] !== at) return marks;
      const next = { ...marks };
      delete next[step.key];
      return next;
    });
    return false;
  }
}

/** Send the reminders that are due. Called by the daily cron. */
export async function sendProspectFollowUps(now = Date.now()) {
  const [requests, orders] = await Promise.all([
    listConceptRequests(),
    listPortalOrders(),
  ]);
  const customers = new Set(
    orders
      .filter((order) => !order.demo)
      .map((order) => order.client.email.toLowerCase()),
  );
  const sent: string[] = [];

  for (const request of requests) {
    if (request.status !== "sent" || !request.sentAt) continue;
    if (customers.has(request.lead.email.toLowerCase())) continue;
    const step = dueStep(request.sentAt, request.followUps, now);
    if (!step) continue;
    const ok = await sendStep(request.id, step, now, (stopKey) =>
      step.key === "day2"
        ? sendConceptsDay2(request, stopKey)
        : sendConceptsDay5(request, stopKey),
    );
    if (ok) sent.push(`${request.id} ${step.key}`);
  }

  for (const order of orders) {
    if (!isOpenQuote(order)) continue;
    const step = dueStep(order.createdAt, order.payReminders, now);
    if (!step) continue;
    const ok = await sendStep(order.ref, step, now, (stopKey) =>
      step.key === "day2"
        ? sendQuoteDay2(order, stopKey)
        : sendQuoteDay5(order, stopKey),
    );
    if (ok) sent.push(`${order.ref} ${step.key}`);
  }

  return { checked: requests.length + orders.length, sent };
}

/** Where a prospect's stop link stands, for the /stop-reminders page. */
export async function stopLinkState(id: string, key: string) {
  if (!ID.test(id)) return "unknown";
  const marks = await readMarks(id);
  if (!marks?.stopKey || !sameKey(key, marks.stopKey)) return "unknown";
  return marks.stopped ? "stopped" : "active";
}

/** The prospect's own stop link. False if the link doesn't match. */
export async function stopByProspect(id: string, key: string) {
  const state = await stopLinkState(id, key);
  if (state === "unknown") return false;
  if (state === "active") {
    await updateMarks(id, (marks) =>
      marks?.stopped
        ? marks
        : {
            ...marks,
            stopped: { at: new Date().toISOString(), by: "prospect" },
          },
    );
  }
  return true;
}

/** The team stops them: the prospect replied, booked a call, or said no. */
export async function stopByTeam(id: string, email?: string) {
  if (!ID.test(id)) throw new Error("Unknown request.");
  await updateMarks(id, (marks) =>
    marks?.stopped
      ? marks
      : {
          ...marks,
          stopped: { at: new Date().toISOString(), by: "team", email },
        },
  );
}

/** The project a prospect ordered, if any: their follow-ups are then not needed. */
export async function orderFor(email: string) {
  const orders = await listPortalOrders();
  return (
    orders.find(
      (order) =>
        !order.demo &&
        order.client.email.toLowerCase() === email.toLowerCase(),
    )?.ref ?? null
  );
}

export type ScheduleRow = {
  label: string;
  state: "sent" | "due" | "skipped" | "off";
  at?: string;
};

/** Each reminder's state, for the team's pages. */
export function followUpSchedule(
  start: string,
  marks?: ProspectFollowUps,
  now = Date.now(),
): ScheduleRow[] {
  return STEPS.map((step) => {
    const label =
      step.key === "day2" ? "Day 2 reminder" : "Day 5, last reminder";
    const dueAt = Date.parse(start) + step.days * DAY;
    const sentAt = marks?.[step.key];
    if (sentAt) return { label, state: "sent", at: sentAt };
    if (marks?.stopped) return { label, state: "off" };
    if (now >= dueAt + WINDOW_DAYS * DAY) return { label, state: "skipped" };
    return { label, state: "due", at: new Date(dueAt).toISOString() };
  });
}

// ─── The emails ──────────────────────────────────────────────────────────────

const single = findVideoPackage("single")!;
const five = findVideoPackage("five")!;

const listStyle =
  "margin:0 0 16px;padding-left:22px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#4A5568";

function conceptsEmail(
  request: ConceptRequest,
  stopKey: string,
  content: {
    subject: string;
    heading: string;
    bodyHtml: string;
    text: string;
    preheader: string;
    button: { label: string; href: string };
    afterButton: string;
  },
) {
  const name = firstName(request.lead.name);
  const stop = {
    reason: "You're getting this because you asked us for free video concepts.",
    href: stopPage(request.id, stopKey),
  };
  return sendCustomerEmail({
    to: [request.lead.email],
    subject: content.subject,
    html: brandedEmail({
      eyebrow: "Your 3 video concepts",
      heading: content.heading,
      bodyHtml: `<p>Hi ${escapeHtml(name)},</p>${content.bodyHtml}`,
      preheader: content.preheader,
      button: content.button,
      afterButton: content.afterButton,
      stopLink: stop,
    }),
    text: `Hi ${name},\n\n${content.text}\n\nThe Scribebunny studio\n\n${stop.reason} Stop these reminders: ${stop.href}`,
    headers: unsubscribeHeaders(stopOneClick(request.id, stopKey)),
  });
}

function sendConceptsDay2(request: ConceptRequest, stopKey: string) {
  const site = request.research?.url ?? request.lead.website;
  const titles = request.concepts
    .map(
      (concept) =>
        `<li style="margin:0 0 6px"><strong>${escapeHtml(concept.title)}</strong> (${escapeHtml(concept.style)})</li>`,
    )
    .join("");
  const singleLine = `A single video is ${formatUsd(single.priceCents)}, ${single.turnaround.toLowerCase()}, with ${VIDEO_SPEC.revisions}.`;
  const fiveLine = `Like more than one? ${five.name} covers all three plus two more, at ${formatUsd(perVideoCents(five))} a video.`;
  return conceptsEmail(request, stopKey, {
    subject: "Which video idea stood out?",
    heading: "Which story should we draw first?",
    bodyHtml: `<p>A couple of days ago we sent you three video concepts${
      site ? ` for <strong>${escapeHtml(site)}</strong>` : ""
    }:</p>
<ol style="${listStyle}">${titles}</ol>
<p>Reply with the number you like best and we'll turn it into your video. ${escapeHtml(singleLine)}</p>
<p>${escapeHtml(fiveLine)}</p>`,
    text: [
      "A couple of days ago we sent you three video concepts:",
      ...request.concepts.map(
        (concept, index) => `${index + 1}. ${concept.title} (${concept.style})`,
      ),
      "",
      `Reply with the number you like best and we'll turn it into your video. ${singleLine}`,
      fiveLine,
      "",
      `Order: ${SITE_URL}/#pricing`,
      `Or book a free call: ${CALENDLY_URL}`,
    ].join("\n"),
    preheader: "Reply with a number and we'll start sketching.",
    button: {
      label: "Turn a concept into a video",
      href: `${SITE_URL}/#pricing`,
    },
    afterButton: `Or book a free call: ${CALENDLY_URL}`,
  });
}

function sendConceptsDay5(request: ConceptRequest, stopKey: string) {
  const steps = `you pick a concept, our storytellers write the script and sketch the storyboard, and we animate it. A single video arrives ${single.turnaround.replace(/^Delivered /, "")}.`;
  return conceptsEmail(request, stopKey, {
    subject: "Still thinking about your video?",
    heading: "Your concepts are ready when you are",
    bodyHtml: `<p>One last note about the three video concepts we drew up for you. When you're ready, here's how it goes: ${escapeHtml(steps)}</p>
<p>Not sure which one fits, or want to change something? Book a free call and we'll talk it through, or simply reply to this email.</p>
<p>This is our last reminder about your concepts.</p>`,
    text: [
      `One last note about the three video concepts we drew up for you. When you're ready, here's how it goes: ${steps}`,
      "",
      "Not sure which one fits, or want to change something? Book a free call, or simply reply to this email.",
      "",
      `Book a free call: ${CALENDLY_URL}`,
      `Or order: ${SITE_URL}/#pricing`,
      "",
      "This is our last reminder about your concepts.",
    ].join("\n"),
    preheader: "Book a free call, or reply and tell us what you think.",
    button: { label: "Book a free call", href: CALENDLY_URL },
    afterButton: `Or order online: ${SITE_URL}/#pricing`,
  });
}

function quoteStop(order: PortalOrder, stopKey: string) {
  return {
    reason: "You're getting this because we set up a quote for you.",
    href: stopPage(order.ref, stopKey),
    oneClick: stopOneClick(order.ref, stopKey),
  };
}

function sendQuoteDay2(order: PortalOrder, stopKey: string) {
  const videos = order.videos.length;
  return emailClient(order, {
    subject: `Your Scribebunny quote is ready (${order.ref})`,
    eyebrow: `Project ${order.ref}`,
    heading: "Your project is ready to start",
    bodyHtml: `<p>A quick reminder: your project portal is set up and waiting for you.</p>${detailsTable(
      [
        ["Project", order.packageName],
        ["Videos", String(videos)],
        ["Price", order.amount],
        ["Delivery", order.turnaround],
      ],
    )}<p>Pay securely in your portal and we'll start sketching. Your invoice comes from ${escapeHtml(PARENT_COMPANY)}. Questions about the quote? Just reply to this email.</p>`,
    preheader: "Pay securely in your portal and we'll start sketching.",
    button: { label: "Pay and get started", href: clientLink(order) },
    stop: quoteStop(order, stopKey),
  });
}

function sendQuoteDay5(order: PortalOrder, stopKey: string) {
  return emailClient(order, {
    subject: `Last reminder: your quote for ${order.packageName}`,
    eyebrow: `Project ${order.ref} · ${order.amount}`,
    heading: "Shall we start on your video?",
    bodyHtml: `<p>This is our last reminder about your quote for <strong>${escapeHtml(order.packageName)}</strong> (${escapeHtml(order.amount)}). Your portal stays open, so you can pay and start whenever you're ready.</p><p>If something doesn't fit, like the price, the number of videos or the timing, reply and tell us what would work better.</p>`,
    preheader: "Your portal stays open whenever you're ready.",
    button: { label: "Pay and get started", href: clientLink(order) },
    stop: quoteStop(order, stopKey),
  });
}
