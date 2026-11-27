import { NextResponse } from "next/server";
import { forwardToCrm } from "@/lib/crm";
import { recordLead } from "@/lib/leads";
import {
  leadSource,
  sourceFields,
  sourceSummary,
  type LeadSource,
} from "@/lib/lead-source";
import { sendTeamEmail } from "@/lib/email";
import { alertEmail, alertText } from "@/lib/email-layout";

type LeadPayload = {
  type: string;
  subject: string;
  fields: Record<string, string | undefined>;
  transcript?: string[];
  /** How the visitor found the site (components/lead-source-tracker.tsx). */
  attribution?: unknown;
};

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/** The form's lead with every value as text, or null when there are no fields. */
function readLead(body: unknown): LeadPayload | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  if (
    !raw.fields ||
    typeof raw.fields !== "object" ||
    Array.isArray(raw.fields)
  ) {
    return null;
  }
  const fields = Object.fromEntries(
    Object.entries(raw.fields as Record<string, unknown>)
      .slice(0, 20)
      .map(([key, value]) => [text(key, 40), text(value, 4000) || undefined]),
  );
  return {
    type: text(raw.type, 40) || "lead",
    subject: text(raw.subject, 200) || "Website lead",
    fields,
    transcript: Array.isArray(raw.transcript)
      ? raw.transcript
          .map((line) => text(line, 1000))
          .filter(Boolean)
          .slice(0, 200)
      : undefined,
    attribution: raw.attribution,
  };
}

async function sendLeadEmail(lead: LeadPayload, source: LeadSource) {
  const fields: [string, string | undefined][] = [
    ["Lead type", lead.type],
    ...Object.entries(lead.fields),
    ...(lead.transcript?.length
      ? [
          [
            "Chat transcript",
            lead.transcript.map((line) => `- ${line}`).join("\n"),
          ] as [string, string],
        ]
      : []),
    ...sourceFields(source),
  ];
  await sendTeamEmail({
    subject: `Website Lead from SB!! ${lead.subject}`,
    html: alertEmail({ title: lead.subject, fields, tone: "lead" }),
    text: alertText(lead.subject, fields),
    replyTo: lead.fields.Email || undefined,
  });
}

export async function POST(request: Request) {
  const lead = readLead(await request.json().catch(() => null));
  if (!lead) {
    return NextResponse.json(
      { ok: false, error: "Missing form fields" },
      { status: 400 },
    );
  }
  try {
    const source = leadSource(request, lead.attribution);
    await sendLeadEmail(lead, source);
    await recordLead({
      type: lead.type,
      name: lead.fields.Name ?? "",
      email: lead.fields.Email ?? "",
      phone: lead.fields.Phone,
      website: lead.fields.Website,
      source,
    }).catch((error) => console.error("Lead record failed", error));

    const fields = lead.fields;
    void forwardToCrm({
      name: fields.Name,
      email: fields.Email,
      phone: fields.Phone,
      website: fields.Website,
      message: [fields.Brief ?? fields.Message, sourceSummary(source)]
        .filter(Boolean)
        .join("\n\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lead email send failed", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send lead" },
      { status: 500 },
    );
  }
}
