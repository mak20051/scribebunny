import { stopByProspect } from "@/lib/prospect-follow-ups";

/**
 * Stops a prospect's reminders. Two callers:
 *   - the button on /stop-reminders (a form post with `confirm`), sent back there
 *   - a mail app's one-click unsubscribe (RFC 8058): POST to the link in the
 *     List-Unsubscribe header, with id and k in the query string
 * Only POST: link scanners that open every URL in an email can't stop anything.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const form = await request.formData().catch(() => null);
  const read = (name: string) =>
    String(form?.get(name) ?? url.searchParams.get(name) ?? "").slice(0, 64);
  const stopped = await stopByProspect(read("id"), read("k"));
  if (form?.get("confirm")) {
    const result = stopped ? "stopped" : "unknown";
    return Response.redirect(
      new URL(`/stop-reminders?result=${result}`, request.url),
      303,
    );
  }
  return new Response(stopped ? "Reminders stopped." : "Link not recognised.", {
    status: stopped ? 200 : 404,
  });
}
