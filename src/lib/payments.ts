import Stripe from "stripe";
import { alertTeam, dashboardLink, newPortalLink } from "@/lib/access";
import { sendCustomerEmail } from "@/lib/email";
import {
  alertEmail,
  alertText,
  brandedEmail,
  detailsTable,
  escapeHtml,
} from "@/lib/email-layout";
import {
  EVERY_VIDEO_INCLUDES,
  findVideoPackage,
  packageSummary,
  VIDEO_SPEC,
  type VideoPackage,
} from "@/lib/packages";
import { PARENT_COMPANY, SITE_URL } from "@/lib/site";

/**
 * Payments: Stripe Checkout for the video packages.
 *
 *   Buy Now ─▶ /api/checkout ─▶ createCheckout() ─▶ Stripe Checkout
 *                                                     │ paid
 *              ┌──────────────────────────────────────┴──────────────┐
 *              ▼                                                      ▼
 *   /order-confirmed (shows the order;               /api/stripe/webhook
 *   fulfils when no webhook is set up)               (fulfils when STRIPE_WEBHOOK_SECRET is set)
 *
 * fulfil() is idempotent: the PaymentIntent carries a `fulfilled` marker, so
 * the team gets one order alert and the customer one confirmation, however
 * often the page reloads. Client portals live in their own app
 * (scribebunny-portal): the alert's "Create their portal" button opens its
 * New client portal form filled in from this order; nothing here opens one. Prices come from lib/packages.ts (inline price_data),
 * so there are no Stripe products to keep in sync.
 */

let client: Stripe | null = null;
export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(key);
  return client;
}

export const paymentsEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

/** True once the Stripe webhook is set up; it then owns fulfilment. */
export const webhookConfigured = () =>
  Boolean(process.env.STRIPE_WEBHOOK_SECRET);

/** Stripe product tax code for video production: "General – Services". */
const TAX_CODE = "txcd_20030000";

type CheckoutInput = {
  productName: string;
  description: string;
  amountCents: number;
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  /** Package orders ask for contact details; portal payments already have them. */
  askForDetails: boolean;
};

/** A Stripe Checkout page for one line item, invoiced by Infinisys LLC. */
async function checkoutUrl(input: CheckoutInput): Promise<string> {
  const { productName, metadata } = input;
  const session = await stripe().checkout.sessions.create({
    // The Infinisys account turns on Stripe Managed Payments by default, which only
    // covers digital products. Video production is a service, so we stay merchant of record.
    managed_payments: { enabled: false },
    // USD only: no conversion to the buyer's local currency.
    adaptive_pricing: { enabled: false },
    currency: "usd",
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: input.amountCents,
          product_data: {
            name: productName,
            description: input.description,
            tax_code: TAX_CODE,
          },
        },
      },
    ],
    billing_address_collection: "auto",
    ...(input.askForDetails
      ? {
          phone_number_collection: { enabled: true },
          custom_fields: [
            {
              key: "website",
              label: { type: "custom", custom: "Company website" },
              type: "text",
              optional: true,
            },
            {
              key: "topic",
              label: {
                type: "custom",
                custom: "What should the video explain?",
              },
              type: "text",
              optional: true,
            },
          ],
        }
      : {}),
    ...(input.customerEmail ? { customer_email: input.customerEmail } : {}),
    invoice_creation: {
      enabled: true,
      invoice_data: {
        description: productName,
        footer: `Scribebunny is a brand of ${PARENT_COMPANY}.`,
        metadata,
      },
    },
    payment_intent_data: { description: productName, metadata },
    metadata,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  } as Stripe.Checkout.SessionCreateParams);
  if (!session.url) throw new Error("Stripe returned no checkout URL");
  return session.url;
}

export function createCheckout(videoPackage: VideoPackage, origin: string) {
  return checkoutUrl({
    productName: `Scribebunny ${videoPackage.name} Package`,
    description: packageSummary(videoPackage),
    amountCents: videoPackage.priceCents,
    metadata: { package: videoPackage.id },
    successUrl: `${origin}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/#pricing`,
    askForDetails: true,
  });
}

export type Order = {
  reference: string;
  sessionId: string;
  paid: boolean;
  videoPackage?: VideoPackage;
  packageName: string;
  amount: string;
  amountCents: number;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  topic?: string;
  billing?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  paymentId?: string;
  dashboardUrl?: string;
  paidAt: string;
  /** Set when this pays for a custom-price portal rather than a package. */
  portalRef?: string;
};

function customField(session: Stripe.Checkout.Session, key: string) {
  return (
    session.custom_fields?.find((field) => field.key === key)?.text?.value ??
    undefined
  );
}

async function loadOrder(sessionId: string) {
  const session = await stripe().checkout.sessions.retrieve(sessionId, {
    expand: ["invoice"],
  });
  const videoPackage = findVideoPackage(session.metadata?.package);
  const invoice =
    session.invoice && typeof session.invoice === "object"
      ? session.invoice
      : null;
  const paymentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const address = session.customer_details?.address;
  const order: Order = {
    reference: `SB-${session.id.slice(-8).toUpperCase()}`,
    sessionId: session.id,
    paid:
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required",
    videoPackage,
    packageName: videoPackage
      ? `${videoPackage.name} package`
      : (session.metadata?.package ?? "Video package"),
    amountCents: session.amount_total ?? 0,
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (session.currency ?? "usd").toUpperCase(),
    }).format((session.amount_total ?? 0) / 100),
    name: session.customer_details?.name ?? "",
    email: session.customer_details?.email ?? session.customer_email ?? "",
    phone: session.customer_details?.phone ?? undefined,
    website: customField(session, "website"),
    topic: customField(session, "topic"),
    billing: [
      address?.city,
      address?.state,
      address?.postal_code,
      address?.country,
    ]
      .filter(Boolean)
      .join(", "),
    invoiceNumber: invoice?.number ?? undefined,
    invoiceUrl: invoice?.hosted_invoice_url ?? undefined,
    paymentId,
    dashboardUrl: paymentId
      ? `https://dashboard.stripe.com/${session.livemode ? "" : "test/"}payments/${paymentId}`
      : undefined,
    portalRef: session.metadata?.portal,
    paidAt: new Date(session.created * 1000).toLocaleString("en-US", {
      timeZone: "America/Phoenix",
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };
  return order;
}

/** What a checkout bought, with no side effects. */
export async function describeOrder(sessionId: string) {
  return loadOrder(sessionId);
}

/** Record a paid order once: the team alert, then the customer's confirmation. */
export async function fulfil(sessionId: string) {
  let order = await loadOrder(sessionId);
  // Custom-price portal payments are settled by the portal app.
  if (order.portalRef) return order;
  const paymentId = order.paymentId;
  if (!order.paid || !paymentId) return order;

  const intent = await stripe().paymentIntents.retrieve(paymentId);
  if (intent.metadata?.fulfilled) return order;

  // Stripe finalizes the invoice a moment after payment; wait once so the
  // alert can link it.
  if (!order.invoiceNumber) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    order = await loadOrder(sessionId);
  }

  await sendOrderAlert(order);
  await stripe()
    .paymentIntents.update(paymentId, {
      metadata: { ...intent.metadata, fulfilled: new Date().toISOString() },
    })
    .catch((error) =>
      console.error("[payments] could not mark fulfilled:", error),
    );
  await sendOrderConfirmation(order).catch((error) =>
    console.error("[payments] customer confirmation failed:", error),
  );
  return order;
}

function orderFields(order: Order): [string, string | undefined][] {
  return [
    ["Package", order.packageName],
    ["Amount paid", order.amount],
    ["Order", order.reference],
    ["Name", order.name],
    ["Email", order.email],
    ["Phone", order.phone],
    ["Company website", order.website],
    ["Video topic", order.topic],
    ["Billing", order.billing],
    [
      "Includes",
      order.videoPackage ? packageSummary(order.videoPackage) : undefined,
    ],
    ["Invoice", order.invoiceNumber],
    ["Invoice link", order.invoiceUrl],
    ["Stripe payment", order.dashboardUrl],
    ["Paid at", `${order.paidAt} (Arizona time)`],
  ];
}

async function sendOrderAlert(order: Order) {
  const title = `New order: ${order.packageName} (${order.amount}) from ${order.name || order.email}`;
  const fields = orderFields(order);
  await alertTeam((member) => ({
    subject: `💰 ${title}`,
    html: alertEmail({
      title,
      fields: [...fields, ["All orders", dashboardLink(member)]],
      tone: "paid",
      link: {
        label: "Create their portal",
        href: newPortalLink(order.sessionId, member),
      },
    }),
    text: `${alertText(title, fields)}\n\nCreate their portal: ${newPortalLink(order.sessionId, member)}`,
    replyTo: order.email || undefined,
  }));
}

async function sendOrderConfirmation(order: Order) {
  if (!order.email) return;
  const first = escapeHtml(order.name.split(" ")[0] || "there");
  const delivery =
    order.videoPackage?.turnaround.toLowerCase() ??
    "on the schedule we plan together";
  const summary = detailsTable([
    ["Package", order.packageName],
    ["Amount paid", order.amount],
    ["Order", order.reference],
    ["Delivery", delivery[0].toUpperCase() + delivery.slice(1)],
  ]);
  const includes = EVERY_VIDEO_INCLUDES.map(
    (item) => `<li style="margin:0 0 6px">${escapeHtml(item)}</li>`,
  ).join("");
  const body = `<p>Hi ${first},</p>
<p>Thank you for your order! We're a small studio that loves to draw and tell stories, and we can't wait to start on yours.</p>
${summary}
<p><strong>What happens next</strong></p>
<p>1. Within 24 hours we email you a private link to your project portal. Send us your brief there: your website, what the video should explain, who it's for, and any brand files.<br>
2. We write the script and sketch the storyboard.<br>
3. We animate, voice, and deliver your video (${escapeHtml(delivery)}), with ${escapeHtml(VIDEO_SPEC.revisions)} to get it just right.</p>
<p><strong>Every video includes</strong></p>
<ul style="margin:0 0 16px;padding-left:20px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#4A5568">${includes}</ul>
<p>Your receipt and invoice from ${escapeHtml(PARENT_COMPANY)} arrive separately from Stripe.</p>`;

  await sendCustomerEmail({
    to: [order.email],
    subject: `Your Scribebunny order is confirmed (${order.reference})`,
    html: brandedEmail({
      eyebrow: `Payment received · ${order.amount}`,
      heading: "Your story is on our drawing board!",
      bodyHtml: body,
      preheader: "Your private project portal link arrives within 24 hours.",
      button: { label: "See videos we've made", href: `${SITE_URL}/work` },
      afterButton: "Questions before then? Just reply to this email.",
    }),
    text: `Hi ${order.name.split(" ")[0] || "there"},\n\nThank you for your order (${order.reference}): ${order.packageName}, ${order.amount}.\n\nWithin 24 hours we'll email you a private link to your project portal, where you send your brief.\n\nWe'll write the script, sketch the storyboard, and deliver your video (${delivery}).\n\nThe Scribebunny studio`,
  });
}
