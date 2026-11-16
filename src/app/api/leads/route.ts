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
  try {
    const lead = (await request.json()) as LeadPayload;
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

    const fields = lead.fields ?? {};
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
