import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

type LeadPayload = {
  type: string;
  subject: string;
  fields: Record<string, string | undefined>;
  transcript?: string[];
};

const LEAD_RECIPIENTS = "mehroz@aimviz.com, sohail.ahmed@aimviz.com";
const CRM_FORM_URL =
  "https://aimviz-nextjs.vercel.app/api/crm/forms/3f2fff02e86860bc5bc23fc318ebc9a62f0abb58eadea70b9c11daf94267a46c/submit";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || "true") === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendLeadEmail(lead: LeadPayload) {
  const from = process.env.LEAD_FROM_EMAIL || process.env.SMTP_USER;
  const fieldLines = Object.entries(lead.fields)
    .map(([key, value]) => `${key}: ${value || ""}`)
    .join("\n");
  const transcript = lead.transcript?.length
    ? `\n\nChat transcript:\n${lead.transcript.map((line) => `- ${line}`).join("\n")}`
    : "";
  const text = `Lead type: ${lead.type}\n\n${fieldLines}${transcript}`;

  await transporter.sendMail({
    from,
    to: LEAD_RECIPIENTS,
    subject: `Website Lead from SB!! ${lead.subject}`,
    text,
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
