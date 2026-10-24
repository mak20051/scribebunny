import { NextResponse } from "next/server";
import { forwardToCrm } from "@/lib/crm";
import { recordLead } from "@/lib/leads";
import { sendTeamEmail } from "@/lib/email";
import { alertEmail, alertText } from "@/lib/email-layout";

type LeadPayload = {
  type: string;
  subject: string;
  fields: Record<string, string | undefined>;
  transcript?: string[];
};

async function sendLeadEmail(lead: LeadPayload) {
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
    await sendLeadEmail(lead);
    await recordLead({
      type: lead.type,
      name: lead.fields.Name ?? "",
      email: lead.fields.Email ?? "",
      phone: lead.fields.Phone,
      website: lead.fields.Website,
    }).catch((error) => console.error("Lead record failed", error));

    const fields = lead.fields ?? {};
    void forwardToCrm({
      name: fields.Name,
      email: fields.Email,
      phone: fields.Phone,
      website: fields.Website,
      message: fields.Brief ?? fields.Message,
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
