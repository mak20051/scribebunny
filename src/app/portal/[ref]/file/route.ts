import { filesFolder, INLINE_TYPES } from "@/lib/attachments";
import { openOrder } from "@/lib/portal";
import { readFile } from "@/lib/store";

type Context = { params: Promise<{ ref: string }> };

const notFound = () => new Response("Not found", { status: 404 });

/** A message attachment, for people with a key to this order only. */
export async function GET(request: Request, { params }: Context) {
  const { ref } = await params;
  const url = new URL(request.url);
  const path = url.searchParams.get("p") ?? "";
  const opened = await openOrder(ref, url.searchParams.get("k") ?? undefined);
  if (!opened || !path.startsWith(filesFolder(ref))) return notFound();

  const attachment = opened.order.messages
    .flatMap((message) => message.attachments ?? [])
    .find((item) => item.path === path);
  const file = attachment ? await readFile(path) : null;
  if (!attachment || !file) return notFound();

  const inline =
    INLINE_TYPES.includes(file.contentType) &&
    url.searchParams.get("download") !== "1";
  const fallbackName = attachment.name.replace(/[^\w.\- ]+/g, "_");
  const headers = new Headers({
    "Content-Type": inline ? file.contentType : "application/octet-stream",
    "Content-Length": String(file.size),
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(attachment.name)}`,
    "Cache-Control": "private, max-age=300",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  });
  // Uploaded files never run as pages on this site (PDFs need the browser's viewer).
  if (file.contentType !== "application/pdf") {
    headers.set(
      "Content-Security-Policy",
      "default-src 'none'; img-src 'self'; sandbox",
    );
  }
  return new Response(file.stream, { headers });
}
