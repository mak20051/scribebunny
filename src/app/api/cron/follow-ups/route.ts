import { sendFollowUps } from "@/lib/launch";
import { sendProspectFollowUps } from "@/lib/prospect-follow-ups";

export const maxDuration = 60;

/**
 * Daily (vercel.json): send the follow-ups that are due: day 7 and day 30 after
 * delivery (lib/launch.ts), and day 2 and day 5 reminders to prospects who got
 * concepts or a quote but haven't bought (lib/prospect-follow-ups.ts). With
 * CRON_SECRET set, only Vercel's scheduler may call it; either way it sends
 * each email at most once, so an extra call does nothing.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const clients = await sendFollowUps();
  const prospects = await sendProspectFollowUps();
  return Response.json({ clients, prospects });
}
