import {
  alertTeam,
  memberForKey,
  newKey,
  sameKey,
  teamOrderLink,
} from "@/lib/access";
import { filesFolder, type Attachment } from "@/lib/attachments";
import type { Review } from "@/lib/launch";
import { sendCustomerEmail } from "@/lib/email";
import { randomBytes } from "node:crypto";
import {
  alertEmail,
  alertText,
  brandedEmail,
  detailsTable,
  escapeHtml,
} from "@/lib/email-layout";
import { findVideoPackage, formatUsd, VIDEO_SPEC } from "@/lib/packages";
import type { Order } from "@/lib/payments";
import { keyMatches, sign } from "@/lib/signing";
import { PARENT_COMPANY, SITE_URL } from "@/lib/site";
import {
  deleteFiles,
  listPaths,
  readJson,
  updateJson,
  writeJson,
} from "@/lib/store";

/**
 * Client portal: one page per paid order where the client and the studio
 * talk, and the studio tracks each video to completion.
 *
 *   paid order ─▶ openPortal()            private Blob store (lib/store.ts)
 *                   │                       orders/<ref>.json   details, videos, messages
 *                   ├─▶ client email  /portal/<ref>?k=<the order's own random client key>
 *                   └─▶ team alerts   /portal/<ref>?k=<each member's own key> (lib/access.ts)
 *
 * No passwords: links carry random keys. "Send the client a new link" replaces
 * one order's client key; the Team access page replaces one person's key.
 * Orders opened before 2026-10-25 have no client key and keep their signed
 * (HMAC) client link until it is replaced.
 *
 * Every studio update emails the client: messages, each video status change,
 * new video links, and the project being completed or reopened.
 *
 * The demo project (SB-DEMO) is sample data at demo/SB-DEMO.json: opened like any
 * order (a team member's key, or its own random client key, from the dashboard's
 * Demo project button), but it never emails anyone and stays out of the orders
 * list and the growth board.
 */

export const VIDEO_STATUSES = [
  "Waiting for brief",
  "Script & storyboard",
  "Animating",
  "Ready for review",
  "Complete",
] as const;

export type VideoStatus = (typeof VIDEO_STATUSES)[number];
export type Role = "client" | "team";

export type PortalVideo = {
  number: number;
  title: string;
  status: VideoStatus;
  deliveryUrl?: string;
  updatedAt: string;
};

export type PortalOrder = {
  ref: string;
  createdAt: string;
  status: "active" | "complete";
  packageName: string;
  amount: string;
  /** Missing on orders recorded before 2026-10-24; read via orderCents(). */
  amountCents?: number;
  turnaround?: string;
  client: {
    name: string;
    email: string;
    phone?: string;
    website?: string;
  };
  topic?: string;
  invoiceUrl?: string;
  dashboardUrl?: string;
  videos: PortalVideo[];
  messages: PortalMessage[];
  /** Random key in the client's link; missing on orders before 2026-10-25. */
  clientKey?: string;
  /** First time the project was marked complete; starts the follow-up emails. */
  completedAt?: string;
  /** Launch checklist steps the client has ticked (lib/launch.ts). */
  launch?: { done: string[] };
  /** When each follow-up email went out. */
  followUps?: { day7?: string; day30?: string };
  review?: Review;
  /** The sample project: no emails, not listed, not counted. */
  demo?: boolean;
  /** Created by the team from the dashboard, with a custom price. */
  manual?: boolean;
  /**
   * Custom-price portals only: "awaiting" until the client pays with the Pay
   * button (Stripe) or the team marks it paid. Package orders are paid at checkout.
   */
  payment?: {
    status: "awaiting" | "paid";
    method?: "stripe" | "outside";
    paidAt?: string;
  };
};

export type PortalMessage = {
  at: string;
  from: Role;
  author: string;
  text: string;
  /** Screenshots and files, in the order they were attached. */
  attachments?: Attachment[];
};

const STUDIO_AUTHOR = "Scribebunny studio";

/** The client's private link to their order. */
export function clientLink(order: PortalOrder) {
  return `${SITE_URL}${clientPath(order)}`;
}

/** The launch kit in the client's portal: checklist, review, order next. */
export const launchLink = (order: PortalOrder) => `${clientLink(order)}#launch`;

export const clientPath = (order: PortalOrder) =>
  `/portal/${order.ref}?k=${order.clientKey ?? sign(`client|${order.ref}`)}`;

/** The order, and who this key opens it as: any team member, or its client. */
export async function openOrder(ref: string, key?: string) {
  const order = await getPortalOrder(ref);
  if (!order || !key) return null;
  let role: Role | null = null;
  if (await memberForKey(key)) {
    role = "team";
  } else if (
    order.clientKey
      ? sameKey(key, order.clientKey)
      : keyMatches(key, `client|${order.ref}`)
  ) {
    role = "client";
  }
  return role ? { order, role } : null;
}

export const DEMO_REF = "SB-DEMO";

const orderPath = (ref: string) =>
  ref === DEMO_REF ? `demo/${ref}.json` : `orders/${ref}.json`;

export async function getPortalOrder(ref: string) {
  if (!/^[A-Z0-9-]{3,40}$/.test(ref)) return null;
  const order = (await readJson<PortalOrder>(orderPath(ref)))?.value ?? null;
  if (ref !== DEMO_REF || order?.clientKey) return order;
  // First visit, or a demo from before it had its own client key.
  if (order) await writeJson(orderPath(ref), demoOrder());
  else await writeJson(orderPath(ref), demoOrder(), { onlyIfNew: true });
  return (await readJson<PortalOrder>(orderPath(ref)))?.value ?? null;
}

/** Put the demo project back to its sample data. */
export async function resetDemo() {
  const current = await readJson<PortalOrder>(orderPath(DEMO_REF));
  await writeJson(orderPath(DEMO_REF), {
    ...demoOrder(),
    clientKey: current?.value.clientKey ?? newKey(),
  });
  await deleteFiles(filesFolder(DEMO_REF));
}

/** A Five Videos order part-way through: one video of each status. */
function demoOrder(): PortalOrder {
  const five = findVideoPackage("five")!;
  const ago = (hours: number) =>
    new Date(Date.now() - hours * 3_600_000).toISOString();
  const video = (
    number: number,
    title: string,
    status: VideoStatus,
    hours: number,
    deliveryUrl?: string,
  ): PortalVideo => ({
    number,
    title,
    status,
    updatedAt: ago(hours),
    ...(deliveryUrl ? { deliveryUrl } : {}),
  });
  const client = (hours: number, text: string): PortalMessage => ({
    at: ago(hours),
    from: "client",
    author: "Maya Patel",
    text,
  });
  const team = (hours: number, text: string): PortalMessage => ({
    at: ago(hours),
    from: "team",
    author: STUDIO_AUTHOR,
    text,
  });
  return {
    ref: DEMO_REF,
    demo: true,
    clientKey: newKey(),
    createdAt: ago(120),
    status: "active",
    packageName: `${five.name} package`,
    amount: formatUsd(five.priceCents),
    amountCents: five.priceCents,
    turnaround: five.turnaround,
    client: {
      name: "Maya Patel",
      email: "maya@example.com",
      phone: "+1 555-010-2000",
      website: "brightleaf.example",
    },
    topic: "How Brightleaf helps clinics book patients online",
    videos: [
      video(
        1,
        "Homepage explainer",
        "Complete",
        30,
        "https://youtu.be/S5vdBu8gJUg",
      ),
      video(
        2,
        "Booking walkthrough",
        "Ready for review",
        6,
        "https://youtu.be/7wBxpHdds7w",
      ),
      video(3, "Reminders and no-shows", "Animating", 20),
      video(4, "Clinic owner testimonial", "Script & storyboard", 48),
      video(5, "Social teaser", "Waiting for brief", 120),
    ],
    messages: [
      client(
        118,
        "From checkout, what the video should explain: How Brightleaf helps clinics book patients online",
      ),
      client(
        117,
        "Hi! Our site is brightleaf.example. The audience is small clinic owners who still book by phone. Brand files: https://example.com/brightleaf-brand",
      ),
      team(
        110,
        "Thanks Maya! We love this story. We'll send the first script and storyboard for the homepage video tomorrow.",
      ),
      client(
        40,
        "The homepage video looks great. Could the narrator sound a little warmer?",
      ),
      team(
        30,
        "Done! Video 1 is complete with the warmer voice. Video 2 is ready for your review now.",
      ),
    ],
  };
}

/** Every order, newest first. */
export async function listPortalOrders() {
  const paths = await listPaths("orders/");
  const orders = await Promise.all(
    paths.map(async (path) => (await readJson<PortalOrder>(path))?.value),
  );
  return orders
    .filter((order): order is PortalOrder => Boolean(order))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Create the portal for a paid order. Safe to call again: the first call wins. */
export async function openPortal(order: Order): Promise<PortalOrder> {
  const now = new Date().toISOString();
  const count = order.videoPackage?.videos ?? 1;
  const portal: PortalOrder = {
    ref: order.reference,
    createdAt: now,
    status: "active",
    packageName: order.packageName,
    amount: order.amount,
    amountCents: order.amountCents,
    turnaround: order.videoPackage?.turnaround,
    client: {
      name: order.name,
      email: order.email,
      phone: order.phone,
      website: order.website,
    },
    topic: order.topic,
    clientKey: newKey(),
    invoiceUrl: order.invoiceUrl,
    dashboardUrl: order.dashboardUrl,
    videos: newVideos(count, now),
    messages: order.topic
      ? [
          {
            at: now,
            from: "client",
            author: order.name || order.email,
            text: `From checkout, what the video should explain: ${order.topic}`,
          },
        ]
      : [],
  };
  await writeJson(orderPath(portal.ref), portal, { onlyIfNew: true });
  return (await getPortalOrder(portal.ref)) ?? portal;
}

function newVideos(count: number, now: string): PortalVideo[] {
  return Array.from({ length: count }, (_, index) => ({
    number: index + 1,
    title: count === 1 ? "Your video" : `Video ${index + 1}`,
    status: "Waiting for brief",
    updatedAt: now,
  }));
}

/** True once the client has paid (package orders are always paid). */
export const isPaid = (order: PortalOrder) =>
  order.payment?.status !== "awaiting";

/** When the money came in: checkout time for packages, payment time for custom portals. */
export const paidDate = (order: PortalOrder) =>
  order.payment?.paidAt ?? order.createdAt;

export const formatAmount = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );

export type NewPortal = {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  topic?: string;
  projectName: string;
  videos: number;
  amountCents: number;
  turnaround?: string;
  /** Already paid outside Stripe; otherwise the client pays in the portal. */
  paid: boolean;
};

/** A portal the team creates by hand, with its own price and number of videos. */
export async function createManualPortal(input: NewPortal) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 5; attempt++) {
    const ref = `SB-${[...randomBytes(8)].map((byte) => alphabet[byte % alphabet.length]).join("")}`;
    const now = new Date().toISOString();
    const portal: PortalOrder = {
      ref,
      createdAt: now,
      status: "active",
      manual: true,
      packageName: input.projectName,
      amount: formatAmount(input.amountCents),
      amountCents: input.amountCents,
      turnaround: input.turnaround,
      client: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        website: input.website,
      },
      topic: input.topic,
      clientKey: newKey(),
      payment: input.paid
        ? { status: "paid", method: "outside", paidAt: now }
        : { status: "awaiting" },
      videos: newVideos(input.videos, now),
      messages: [],
    };
    if (await writeJson(orderPath(ref), portal, { onlyIfNew: true })) {
      return portal;
    }
  }
  throw new Error("Could not create a project reference. Please try again.");
}

/** Welcome a client to a portal the team created: what they get, and how to pay. */
export async function sendPortalWelcome(order: PortalOrder) {
  const awaiting = order.payment?.status === "awaiting";
  const videos = order.videos.length;
  await emailClient(order, {
    subject: `Your Scribebunny project portal is ready (${order.ref})`,
    eyebrow: `Project ${order.ref}`,
    heading: "Your project portal is ready!",
    bodyHtml: `<p>We're a small studio that loves to draw and tell stories, and we can't wait to start on yours. Your project portal is where we chat, share drafts and deliver your ${videos === 1 ? "video" : "videos"}.</p>${detailsTable(
      [
        ["Project", order.packageName],
        ["Videos", String(videos)],
        [awaiting ? "Price" : "Paid", order.amount],
        ["Delivery", order.turnaround],
      ],
    )}<p>${
      awaiting
        ? `To get started, pay securely in your portal. Your invoice comes from ${PARENT_COMPANY}. Then send us your brief and we'll start sketching.`
        : "Open your portal and send us your brief: your website, what the video should explain, who it's for, and any brand files."
    }</p>`,
    preheader: awaiting
      ? "Pay securely in your portal and we'll start sketching."
      : "Send us your brief and we'll start sketching.",
    button: {
      label: awaiting ? "Pay and get started" : "Open your project portal",
      href: clientLink(order),
    },
  });
}

/**
 * Mark a custom-price portal paid, once. Returns the order if this call did it
 * (and emails the client), or null if it was already paid.
 */
export async function markPortalPaid(
  ref: string,
  details: {
    method: "stripe" | "outside";
    invoiceUrl?: string;
    dashboardUrl?: string;
  },
) {
  let claimed = false;
  const order = await updateOrder(ref, (current) => {
    if (current.payment?.status !== "awaiting") return;
    claimed = true;
    current.payment = {
      status: "paid",
      method: details.method,
      paidAt: new Date().toISOString(),
    };
    if (details.invoiceUrl) current.invoiceUrl = details.invoiceUrl;
    if (details.dashboardUrl) current.dashboardUrl = details.dashboardUrl;
  });
  if (!claimed) return null;
  if (!order.demo) {
    await emailClient(order, {
      subject: `Payment received for ${order.ref}`,
      eyebrow: `Project ${order.ref} · ${order.amount}`,
      heading: "Payment received. Let's get drawing!",
      bodyHtml: `<p>Thank you! We've received ${escapeHtml(order.amount)} for ${escapeHtml(order.packageName)}.${
        details.method === "stripe"
          ? ` Your receipt and invoice from ${PARENT_COMPANY} arrive separately from Stripe.`
          : ""
      }</p><p>Next, send us your brief in your portal: your website, what the video should explain, who it's for, and any brand files.</p>`,
      preheader: "Send us your brief and we'll start sketching.",
    });
  }
  return order;
}

/** Change an order and save it, retrying if someone else saved first. */
export const updateOrder = (
  ref: string,
  change: (order: PortalOrder) => void,
) => updateJson<PortalOrder>(orderPath(ref), change);

/** A new client link for an order (the old one stops working), emailed to the client. */
export async function replaceClientKey(ref: string) {
  const order = await updateJson<PortalOrder>(orderPath(ref), (current) => {
    if (current.demo) throw new Error("The demo keeps its links.");
    current.clientKey = newKey();
  });
  await emailClient(order, {
    subject: `Your new Scribebunny portal link (${order.ref})`,
    eyebrow: `Order ${order.ref}`,
    heading: "Here's your new portal link",
    bodyHtml:
      "<p>We've given your project portal a new private link. The old one no longer works, so please use the button below from now on.</p>",
    preheader: "Your project portal has a new private link.",
  });
}

export async function addMessage(
  ref: string,
  from: Role,
  text: string,
  attachments: Attachment[] = [],
) {
  let message: PortalMessage | undefined;
  const order = await updateJson<PortalOrder>(orderPath(ref), (current) => {
    message = {
      at: new Date().toISOString(),
      from,
      author:
        from === "team"
          ? STUDIO_AUTHOR
          : current.client.name || current.client.email,
      text,
      ...(attachments.length ? { attachments } : {}),
    };
    current.messages.push(message);
    if (current.demo) current.messages = current.messages.slice(-40);
  });
  await notifyMessage(order, message!);
}

export async function updateVideo(
  ref: string,
  number: number,
  changes: { title?: string; status?: VideoStatus; deliveryUrl?: string },
) {
  let wasStatus: VideoStatus | undefined;
  let hadUrl: string | undefined;
  const order = await updateJson<PortalOrder>(orderPath(ref), (current) => {
    const target = current.videos.find((item) => item.number === number);
    if (!target) throw new Error(`No video ${number} on ${ref}`);
    wasStatus = target.status;
    hadUrl = target.deliveryUrl;
    Object.assign(target, changes, { updatedAt: new Date().toISOString() });
    if (!target.deliveryUrl) delete target.deliveryUrl;
  });
  const video = order.videos.find((item) => item.number === number)!;
  const statusChanged = video.status !== wasStatus;
  const newLink = Boolean(video.deliveryUrl) && video.deliveryUrl !== hadUrl;
  if (statusChanged || newLink) await notifyVideo(order, video, statusChanged);
}

export async function setOrderStatus(
  ref: string,
  status: PortalOrder["status"],
) {
  let changed = false;
  const order = await updateJson<PortalOrder>(orderPath(ref), (current) => {
    changed = current.status !== status;
    current.status = status;
    if (status === "complete") {
      current.completedAt ??= new Date().toISOString();
      for (const video of current.videos) {
        if (video.status !== "Complete") {
          video.status = "Complete";
          video.updatedAt = new Date().toISOString();
        }
      }
    }
  });
  if (changed) await notifyOrderStatus(order);
}

async function notifyMessage(order: PortalOrder, message: PortalMessage) {
  if (order.demo) return;
  if (message.from === "client") {
    const title = `New message from ${message.author} on ${order.ref}`;
    const fields: [string, string | undefined][] = [
      ["Order", `${order.ref} · ${order.packageName}`],
      ["From", message.author],
      ["Email", order.client.email],
      ["Message", message.text || undefined],
      ["Attachments", fileNames(message)],
    ];
    await alertTeam((member) => ({
      subject: `💬 ${title}`,
      html: alertEmail({
        title,
        fields,
        tone: "lead",
        link: {
          label: "Reply in the portal",
          href: teamOrderLink(order.ref, member),
        },
      }),
      text: `${alertText(title, fields)}\n\nReply in the portal: ${teamOrderLink(order.ref, member)}`,
      replyTo: order.client.email || undefined,
    }));
    return;
  }
  await emailClient(order, {
    subject: `New message from Scribebunny about ${order.ref}`,
    eyebrow: `Order ${order.ref}`,
    heading: "You have a new message from the studio",
    bodyHtml: `${message.text ? `<p>${escapeHtml(message.text).replace(/\n/g, "<br>")}</p>` : ""}${
      message.attachments?.length
        ? `<p>📎 ${escapeHtml(fileNames(message)!)}<br>Open your portal to see ${message.attachments.length === 1 ? "it" : "them"}.</p>`
        : ""
    }`,
    preheader: message.text.slice(0, 90) || `📎 ${fileNames(message)}`,
  });
}

const fileNames = (message: PortalMessage) =>
  message.attachments?.map((file) => file.name).join(", ") || undefined;

/** What the client is told when a video reaches each step. */
const VIDEO_UPDATES: Record<
  VideoStatus,
  { heading: string; body: string; preheader: string }
> = {
  "Waiting for brief": {
    heading: "We're ready for your brief",
    body: "is waiting for your brief. Send it to us in your portal and we'll get started.",
    preheader: "Send us your brief to get started.",
  },
  "Script & storyboard": {
    heading: "We've started on your script",
    body: "is in script and storyboard: we're writing the words and sketching the scenes.",
    preheader: "We're writing and sketching your story.",
  },
  Animating: {
    heading: "Your video is being animated",
    body: "is now being animated and voiced.",
    preheader: "Your storyboard is coming to life.",
  },
  "Ready for review": {
    heading: "Your video is ready for review!",
    body: `is ready. Watch it in your portal and send us any changes there. Every video includes ${VIDEO_SPEC.revisions}.`,
    preheader: "Take a look and tell us what you think.",
  },
  Complete: {
    heading: "Your video is complete!",
    body: "is finished and ready to use. You'll find it in your portal, with a launch checklist: six quick ways to get it seen and turn views into customers.",
    preheader: "It's yours to use. Here's how to launch it.",
  },
};

async function notifyVideo(
  order: PortalOrder,
  video: PortalVideo,
  statusChanged: boolean,
) {
  if (order.demo) return;
  const step = VIDEO_STATUSES.indexOf(video.status) + 1;
  const update = VIDEO_UPDATES[video.status];
  await emailClient(order, {
    subject: statusChanged
      ? `${video.title}: ${video.status}`
      : `New link for ${video.title}`,
    eyebrow: `Order ${order.ref} · Step ${step} of ${VIDEO_STATUSES.length}`,
    heading: statusChanged
      ? update.heading
      : "There's a new link for your video",
    bodyHtml: statusChanged
      ? `<p><strong>${escapeHtml(video.title)}</strong> ${escapeHtml(update.body)}</p>`
      : `<p>We've added a new link for <strong>${escapeHtml(video.title)}</strong>. Watch it in your portal.</p>`,
    preheader: statusChanged ? update.preheader : "Watch it in your portal.",
    ...(video.status === "Complete"
      ? {
          button: {
            label: "See your launch checklist",
            href: launchLink(order),
          },
        }
      : {}),
  });
}

async function notifyOrderStatus(order: PortalOrder) {
  if (order.demo) return;
  if (order.status === "complete") {
    await emailClient(order, {
      subject: `Your Scribebunny project ${order.ref} is complete`,
      eyebrow: `Order ${order.ref}`,
      heading: "That's a wrap!",
      bodyHtml:
        "<p>Every video in your order is complete. Thank you for letting us draw your story. Your videos stay in your portal whenever you need them.</p><p>Next, launch them: your portal has a checklist with six quick ways to get them seen and turn views into customers.</p>",
      preheader:
        "Every video in your order is complete. Here's how to launch them.",
      button: { label: "See your launch checklist", href: launchLink(order) },
    });
    return;
  }
  await emailClient(order, {
    subject: `We've reopened your Scribebunny project ${order.ref}`,
    eyebrow: `Order ${order.ref}`,
    heading: "We've reopened your project",
    bodyHtml:
      "<p>Your project is open again so we can keep working on it together. Everything is in your portal.</p>",
    preheader: "Your project is open again.",
  });
}

/** A branded email to the order's client; the button opens their portal unless given another. */
export async function emailClient(
  order: PortalOrder,
  content: {
    subject: string;
    eyebrow: string;
    heading: string;
    bodyHtml: string;
    preheader: string;
    button?: { label: string; href: string };
  },
) {
  if (!order.client.email) return;
  const first = escapeHtml(order.client.name.split(" ")[0] || "there");
  const button = content.button ?? {
    label: "Open your project portal",
    href: clientLink(order),
  };
  const link = button.href;
  await sendCustomerEmail({
    to: [order.client.email],
    subject: content.subject,
    html: brandedEmail({
      eyebrow: content.eyebrow,
      heading: content.heading,
      bodyHtml: `<p>Hi ${first},</p>${content.bodyHtml}`,
      preheader: content.preheader,
      button,
      afterButton: "Or simply reply to this email.",
    }),
    text: `Hi ${order.client.name.split(" ")[0] || "there"},\n\n${content.heading}\n\n${button.label}: ${link}\n\nThe Scribebunny studio`,
  });
}
