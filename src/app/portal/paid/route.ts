import { NextResponse } from "next/server";
import { fulfil, paymentsEnabled } from "@/lib/payments";
import { clientPath, getPortalOrder } from "@/lib/portal";

export const maxDuration = 30;

/**
 * Stripe sends the client here after paying a custom-price portal. Settling
 * is idempotent (the webhook may do it too); then back to their portal.
 */
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  const home = new URL("/", request.url);
  if (!sessionId || !paymentsEnabled()) return NextResponse.redirect(home);
  try {
    const order = await fulfil(sessionId);
    const portal = order.portalRef
      ? await getPortalOrder(order.portalRef)
      : null;
    if (!portal) return NextResponse.redirect(home);
    return NextResponse.redirect(
      new URL(`${clientPath(portal)}&paid=1`, request.url),
    );
  } catch (error) {
    console.error("[portal/paid] could not settle", error);
    return NextResponse.redirect(home);
  }
}
