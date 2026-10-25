import { alertTeam, teamOrderLink } from "@/lib/access";
import { alertEmail, alertText, escapeHtml } from "@/lib/email-layout";
import {
  clientLink,
  emailClient,
  launchLink,
  listPortalOrders,
  updateOrder,
  type PortalOrder,
} from "@/lib/portal";
import { SITE_URL } from "@/lib/site";

/**
 * After delivery: help the client launch the video, then follow up.
 *
 *   a video is Complete ─▶ portal shows "Launch your video" (#launch):
 *                          checklist, review form (#review), order your next video
 *   project marked complete ─▶ completedAt
 *        ├─ day 7  ─▶ "How's it doing?"  checklist + review request
 *        └─ day 30 ─▶ "How did it perform?"  results + review + order next
 *   follow-ups go out from the daily cron (/api/cron/follow-ups, vercel.json),
 *   each at most once per order, never for the demo.
 */

export const LAUNCH_STEPS = [
  {
    id: "website",
    title: "Put it on your website",
    tips: [
      "Place it near the top of your homepage or main landing page.",
      "Turn on captions and put one clear button under it, like Book a demo or Start free.",
    ],
  },
  {
    id: "youtube",
    title: "Upload it to YouTube",
    tips: [
      "Use the words people search for in the title, and add your link in the description.",
      "Add captions and a custom thumbnail, then embed the YouTube version on your site so it helps your search ranking too.",
    ],
  },
  {
    id: "social",
    title: "Share it on social",
    tips: [
      "Upload the video itself to LinkedIn, Instagram, Facebook or TikTok instead of posting a link.",
      "Short 15 to 30 second cuts with captions work best. Ask us if you need vertical or square versions.",
    ],
  },
  {
    id: "sales",
    title: "Use it in sales",
    tips: [
      "Add it to your email signature and to outreach emails as a thumbnail that links to the video.",
      "Drop it into decks, proposals and demo follow-ups.",
    ],
  },
  {
    id: "ads",
    title: "Run it as an ad",
    tips: [
      "Use a 6 to 15 second cut on Meta, LinkedIn or YouTube.",
      "Then retarget the people who watched with your offer.",
    ],
  },
  {
    id: "measure",
    title: "Check the results after 30 days",
    tips: [
      "Look at views, how much of the video people watch, and clicks.",
      "Compare leads or sign-ups with the month before the video.",
    ],
  },
] as const;

export type Review = {
  at: string;
  rating: number;
  quote: string;
  name: string;
  role?: string;
  company?: string;
  /** The client said Scribebunny may feature it on its website. */
  canFeature: boolean;
};

const FOLLOW_UPS = [
  { key: "day7", days: 7 },
  { key: "day30", days: 30 },
] as const;

type FollowUp = (typeof FOLLOW_UPS)[number]["key"];

const DAY = 86_400_000;

export const reviewLink = (order: PortalOrder) => `${clientLink(order)}#review`;
export const ORDER_NEXT_URL = `${SITE_URL}/#pricing`;

/** Tick or untick one checklist step. */
export async function toggleLaunchStep(ref: string, step: string) {
  if (!LAUNCH_STEPS.some((item) => item.id === step)) {
    throw new Error("Unknown launch step.");
  }
  await updateOrder(ref, (order) => {
    const done = new Set(order.launch?.done ?? []);
    if (done.has(step)) done.delete(step);
    else done.add(step);
    order.launch = {
      done: LAUNCH_STEPS.map((item) => item.id).filter((id) => done.has(id)),
    };
  });
}

/** Save (or replace) the client's review and tell the team. */
export async function saveReview(ref: string, review: Omit<Review, "at">) {
  const order = await updateOrder(ref, (current) => {
    current.review = { ...review, at: new Date().toISOString() };
  });
  if (order.demo) return;
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  const title = `New review from ${review.name}: ${stars}`;
  const fields: [string, string | undefined][] = [
    ["Order", `${order.ref} · ${order.packageName}`],
    ["Rating", `${stars} (${review.rating} of 5)`],
    ["Review", review.quote],
    ["Name", review.name],
    ["Role", review.role],
    ["Company", review.company],
    ["Email", order.client.email],
    [
      "Website use",
      review.canFeature
        ? "Yes, we may feature it on scribebunny.com"
        : "No, keep it private",
    ],
  ];
  await alertTeam((member) => ({
    subject: `⭐ ${title}`,
    html: alertEmail({
      title,
      fields,
      tone: "lead",
      link: {
        label: "Open the project",
        href: teamOrderLink(order.ref, member),
      },
    }),
    text: `${alertText(title, fields)}\n\nProject: ${teamOrderLink(order.ref, member)}`,
    replyTo: order.client.email || undefined,
  }));
}

/**
 * Send the follow-ups that are due. Each is claimed on the order before it is
 * sent, so running this twice never sends one twice. If day 30 is due before
 * day 7 went out, only day 30 is sent.
 */
export async function sendFollowUps(now = Date.now()) {
  const orders = await listPortalOrders();
  const sent: string[] = [];
  for (const order of orders) {
    if (order.demo || order.status !== "complete" || !order.completedAt)
      continue;
    if (!order.client.email) continue;
    const age = (now - Date.parse(order.completedAt)) / DAY;
    const due = [...FOLLOW_UPS]
      .reverse()
      .find((item) => age >= item.days && !order.followUps?.[item.key]);
    if (!due) continue;

    const at = new Date(now).toISOString();
    let claimed = false;
    const claimedOrder = await updateOrder(order.ref, (current) => {
      if (current.followUps?.[due.key]) return;
      claimed = true;
      const marks: Partial<Record<FollowUp, string>> = { ...current.followUps };
      for (const item of FOLLOW_UPS) {
        if (item.days <= due.days) marks[item.key] ??= at;
      }
      current.followUps = marks;
    });
    if (!claimed) continue;

    try {
      if (due.key === "day7") await sendDay7(claimedOrder);
      else await sendDay30(claimedOrder);
      sent.push(`${order.ref} ${due.key}`);
    } catch (error) {
      console.error(`[follow-ups] ${order.ref} ${due.key} failed:`, error);
      // Release the claim so tomorrow's run tries again.
      await updateOrder(order.ref, (current) => {
        if (current.followUps && current.followUps[due.key] === at) {
          delete current.followUps[due.key];
        }
      });
    }
  }
  return { checked: orders.length, sent };
}

function reviewAsk(order: PortalOrder) {
  return order.review
    ? ""
    : `<p>Got a minute? A short review helps other teams find a small studio like ours, and we'd love to hear what you think. <a href="${escapeHtml(reviewLink(order))}" style="color:#FF3333;font-weight:700">Leave a review</a></p>`;
}

async function sendDay7(order: PortalOrder) {
  await emailClient(order, {
    subject: "How's your Scribebunny video doing?",
    eyebrow: `Order ${order.ref} · One week in`,
    heading: "A week in: how's your video doing?",
    bodyHtml: `<p>It's been a week since we wrapped your project. If your video isn't out in the world yet, your launch checklist has six quick ways to get it seen: your website, YouTube, social, sales emails, ads, and how to measure what it brings in.</p>${reviewAsk(order)}`,
    preheader: "Six quick ways to get your new video seen.",
    button: { label: "Open your launch checklist", href: launchLink(order) },
  });
}

async function sendDay30(order: PortalOrder) {
  await emailClient(order, {
    subject: "30 days with your Scribebunny video",
    eyebrow: `Order ${order.ref} · One month in`,
    heading: "30 days in: how did it perform?",
    bodyHtml: `<p>Now's a good time to check the numbers: views, how much of the video people watch, clicks, and leads or sign-ups compared with the month before. Reply and tell us how it went. We love hearing how our stories land.</p>${reviewAsk(order)}<p>Ready for the next story? Ordering takes a minute, and we'll start sketching right away.</p>`,
    preheader: "Check your numbers, and tell us how it went.",
    button: { label: "Order your next video", href: ORDER_NEXT_URL },
  });
}
