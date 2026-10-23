import { NextResponse } from "next/server";
import { sendTeamEmail } from "@/lib/email";
import { alertEmail, alertText } from "@/lib/email-layout";

type LeadPayload = {
  type: string;
  subject: string;
  fields: Record<string, string | undefined>;
  transcript?: string[];
};

const CRM_FORM_URL =
  "https://aimviz-nextjs.vercel.app/api/crm/forms/3f2fff02e86860bc5bc23fc318ebc9a62f0abb58eadea70b9c11daf94267a46c/submit";

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

    const fields = lead.fields ?? {};
    fetch(CRM_FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fields.Name ?? "",
        email: fields.Email ?? "",
        phone: fields.Phone ?? "",
        company: fields.Website ?? "",
        message: fields.Brief ?? fields.Message ?? "",
        source_url: "https://scribebunny.com",
      }),
    }).catch((error) => console.error("CRM forward failed", error));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lead email send failed", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send lead" },
      { status: 500 },
    );
  }
}
