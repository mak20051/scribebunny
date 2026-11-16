import { NextResponse } from "next/server";
import { leadSource } from "@/lib/lead-source";
import { findVideoPackage } from "@/lib/packages";
import { createCheckout, paymentsEnabled } from "@/lib/payments";

export async function POST(request: Request) {
  if (!paymentsEnabled()) {
    console.error("Checkout failed: STRIPE_SECRET_KEY is not set");
    return NextResponse.json(
      { error: "Checkout is not available right now." },
      { status: 503 },
    );
  }

  const { packageId, attribution } = (await request
    .json()
    .catch(() => ({}))) as { packageId?: string; attribution?: unknown };
  const videoPackage = findVideoPackage(packageId);
  if (!videoPackage) {
    return NextResponse.json({ error: "Unknown package." }, { status: 400 });
  }

  try {
    const url = await createCheckout(
      videoPackage,
      new URL(request.url).origin,
      leadSource(request, attribution),
    );
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout session failed", error);
    return NextResponse.json(
      { error: "Checkout is not available right now." },
      { status: 500 },
    );
  }
}
