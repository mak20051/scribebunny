import { after, NextResponse } from "next/server";
import { autoDraftOn, draftConcepts, requestConcepts } from "@/lib/concepts";
import { forwardToCrm } from "@/lib/crm";

// Drafting runs after the response (website research + DeepSeek), when on.
export const maxDuration = 120;

const field = (value: unknown, max: number) =>
  String(value ?? "")
    .trim()
    .slice(0, max);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  // Hidden field real people never fill in.
  if (field(body.company, 200)) return NextResponse.json({ ok: true });

  const lead = {
    name: field(body.name, 120),
    email: field(body.email, 200),
    phone: field(body.phone, 40),
    website: field(body.website, 300) || undefined,
    details: field(body.details, 2000) || undefined,
  };
  if (!lead.name || !lead.phone) {
    return NextResponse.json(
      { error: "Please add your name and phone number." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return NextResponse.json(
      { error: "Please enter a valid business email." },
      { status: 400 },
    );
  }
  if (!lead.website && !lead.details) {
    return NextResponse.json(
      { error: "Add your website or a few lines about your business." },
      { status: 400 },
    );
  }

  try {
    const created = await requestConcepts(lead);
    after(async () => {
      await Promise.all([
        autoDraftOn()
          ? draftConcepts(created.id).catch((error) =>
              console.error("[concepts] draft failed:", error),
            )
          : null,
        forwardToCrm({
          ...lead,
          message: `Free 3 concepts request. ${lead.details ?? ""}`.trim(),
        }),
      ]);
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[concepts] request failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or email us." },
      { status: 500 },
    );
  }
}
