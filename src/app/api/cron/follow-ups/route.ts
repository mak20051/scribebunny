import { sendFollowUps } from "@/lib/launch";

export const maxDuration = 60;

/**
 * Daily (vercel.json): send the day 7 and day 30 follow-ups that are due.
 * With CRON_SECRET set, only Vercel's scheduler may call it; either way it
 * sends each email at most once, so an extra call does nothing.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  return Response.json(await sendFollowUps());
}
