import { sendCustomerEmail, sendTeamEmail } from "@/lib/email";
import {
  alertEmail,
  alertText,
  brandedEmail,
  escapeHtml,
} from "@/lib/email-layout";
import { VIDEO_SPEC } from "@/lib/packages";
import type { Order } from "@/lib/payments";
import { isAdminKey, keyMatches, sign } from "@/lib/signing";
import { SITE_URL } from "@/lib/site";
import { listPaths, readJson, updateJson, writeJson } from "@/lib/store";

/**
 * Client portal: one page per paid order where the client and the studio
 * talk, and the studio tracks each video to completion.
 *
 *   paid order ─▶ openPortal()            private Blob store (lib/store.ts)
 *                   │                       orders/<ref>.json   details, videos, messages
 *                   ├─▶ client email  /portal/<ref>?k=<client key>
 *                   └─▶ team alert    /portal/<ref>?k=<team key>  and  /portal?k=<admin key>
 *
 * No passwords: each link carries an HMAC key for one role and one order, so
 * it can't be guessed or edited. Rotating PORTAL_SECRET revokes every link.
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
};

export type PortalMessage = {
  at: string;
  from: Role;
  author: string;
  text: string;
};

const STUDIO_AUTHOR = "Scribebunny studio";

/** Which role a key grants for this order, if any. The admin key opens every order as the team. */
export function roleFor(ref: string, key?: string): Role | null {
  if (keyMatches(key, `team|${ref}`) || isAdminKey(key)) return "team";
  if (keyMatches(key, `client|${ref}`)) return "client";
  return null;
}

export const portalLink = (ref: string, role: Role) =>
  `${SITE_URL}/portal/${ref}?k=${sign(`${role}|${ref}`)}`;

export const dashboardLink = () => `${SITE_URL}/portal?k=${sign("admin")}`;

const orderPath = (ref: string) => `orders/${ref}.json`;

export async function getPortalOrder(ref: string) {
  if (!/^[A-Z0-9-]{3,40}$/.test(ref)) return null;
  return (await readJson<PortalOrder>(orderPath(ref)))?.value ?? null;
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
export async function openPortal(order: Order) {
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
    invoiceUrl: order.invoiceUrl,
    dashboardUrl: order.dashboardUrl,
    videos: Array.from({ length: count }, (_, index) => ({
      number: index + 1,
      title: count === 1 ? "Your video" : `Video ${index + 1}`,
      status: "Waiting for brief",
      updatedAt: now,
    })),
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
}

export async function addMessage(ref: string, from: Role, text: string) {
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
    };
    current.messages.push(message);
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
  const delivered =
    (video.status === "Ready for review" || video.status === "Complete") &&
    (video.status !== wasStatus || video.deliveryUrl !== hadUrl);
  if (delivered) await notifyVideo(order, video);
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
      for (const video of current.videos) {
        if (video.status !== "Complete") {
          video.status = "Complete";
          video.updatedAt = new Date().toISOString();
        }
      }
    }
  });
  if (changed && status === "complete") await notifyComplete(order);
}

async function notifyMessage(order: PortalOrder, message: PortalMessage) {
  if (message.from === "client") {
    const title = `New message from ${message.author} on ${order.ref}`;
    const fields: [string, string | undefined][] = [
      ["Order", `${order.ref} · ${order.packageName}`],
      ["From", message.author],
      ["Email", order.client.email],
      ["Message", message.text],
    ];
    await sendTeamEmail({
      subject: `💬 ${title}`,
      html: alertEmail({
        title,
        fields,
        tone: "lead",
        link: {
          label: "Reply in the portal",
          href: portalLink(order.ref, "team"),
        },
      }),
      text: `${alertText(title, fields)}\n\nReply in the portal: ${portalLink(order.ref, "team")}`,
      replyTo: order.client.email || undefined,
    });
    return;
  }
  await emailClient(order, {
    subject: `New message from Scribebunny about ${order.ref}`,
    eyebrow: `Order ${order.ref}`,
    heading: "You have a new message from the studio",
    bodyHtml: `<p>${escapeHtml(message.text).replace(/\n/g, "<br>")}</p>`,
    preheader: message.text.slice(0, 90),
  });
}

async function notifyVideo(order: PortalOrder, video: PortalVideo) {
  const ready = video.status === "Ready for review";
  await emailClient(order, {
    subject: ready
      ? `${video.title} is ready for your review`
      : `${video.title} is complete`,
    eyebrow: `Order ${order.ref}`,
    heading: ready
      ? "Your video is ready for review!"
      : "Your video is complete!",
    bodyHtml: ready
      ? `<p><strong>${escapeHtml(video.title)}</strong> is ready. Watch it in your portal and send us any changes there. Every video includes ${escapeHtml(VIDEO_SPEC.revisions)}.</p>`
      : `<p><strong>${escapeHtml(video.title)}</strong> is finished and ready to use. You'll find it in your portal.</p>`,
    preheader: ready
      ? "Take a look and tell us what you think."
      : "It's yours to use.",
  });
}

async function notifyComplete(order: PortalOrder) {
  await emailClient(order, {
    subject: `Your Scribebunny project ${order.ref} is complete`,
    eyebrow: `Order ${order.ref}`,
    heading: "That's a wrap!",
    bodyHtml:
      "<p>Every video in your order is complete. Thank you for letting us draw your story. Your videos stay in your portal whenever you need them.</p>",
    preheader: "Every video in your order is complete.",
  });
}

async function emailClient(
  order: PortalOrder,
  content: {
    subject: string;
    eyebrow: string;
    heading: string;
    bodyHtml: string;
    preheader: string;
  },
) {
  if (!order.client.email) return;
  const first = escapeHtml(order.client.name.split(" ")[0] || "there");
  const link = portalLink(order.ref, "client");
  await sendCustomerEmail({
    to: [order.client.email],
    subject: content.subject,
    html: brandedEmail({
      eyebrow: content.eyebrow,
      heading: content.heading,
      bodyHtml: `<p>Hi ${first},</p>${content.bodyHtml}`,
      preheader: content.preheader,
      button: { label: "Open your project portal", href: link },
      afterButton: "Or simply reply to this email.",
    }),
    text: `Hi ${order.client.name.split(" ")[0] || "there"},\n\n${content.heading}\n\nOpen your project portal: ${link}\n\nThe Scribebunny studio`,
  });
}
