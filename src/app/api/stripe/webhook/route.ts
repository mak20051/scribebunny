import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { fulfil, stripe } from "@/lib/payments";

/**
 * POST /api/stripe/webhook: Stripe → us, signed with STRIPE_WEBHOOK_SECRET.
 *
 *   checkout.session.completed / async_payment_succeeded ─▶ fulfil (idempotent)
 *
 * Anything else is acknowledged and ignored. A 500 makes Stripe retry, so only
 * fulfilment errors return one.
 */
export const maxDuration = 30;

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "webhook not configured" },
      { status: 503 },
    );
  }

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      raw,
      request.headers.get("stripe-signature") ?? "",
      secret,
    );
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    try {
      await fulfil(event.data.object.id);
    } catch (error) {
      console.error(`[stripe/webhook] ${event.type} failed:`, error);
      return NextResponse.json({ error: "handler failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
