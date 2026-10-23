import Stripe from "stripe";
import { NextResponse } from "next/server";
import { findVideoPackage } from "@/lib/packages";
import { PARENT_COMPANY } from "@/lib/site";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request: Request) {
  if (!stripe) {
    console.error("Checkout failed: STRIPE_SECRET_KEY is not set");
    return NextResponse.json(
      { error: "Checkout is not available right now." },
      { status: 503 },
    );
  }

  const { packageId } = (await request.json().catch(() => ({}))) as {
    packageId?: string;
  };
  const videoPackage = findVideoPackage(packageId);
  if (!videoPackage) {
    return NextResponse.json({ error: "Unknown package." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const productName = `Scribebunny ${videoPackage.name} Package`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: videoPackage.priceCents,
            product_data: {
              name: productName,
              description: videoPackage.turnaround,
            },
          },
        },
      ],
      phone_number_collection: { enabled: true },
      custom_fields: [
        {
          key: "website",
          label: { type: "custom", custom: "Company website" },
          type: "text",
          optional: true,
        },
      ],
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: productName,
          footer: `Scribebunny is a brand of ${PARENT_COMPANY}.`,
          metadata: { package: videoPackage.id },
        },
      },
      metadata: { package: videoPackage.id },
      success_url: `${origin}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session failed", error);
    return NextResponse.json(
      { error: "Checkout is not available right now." },
      { status: 500 },
    );
  }
}
