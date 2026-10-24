import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import nodemailer from "nodemailer";
import { EMAIL, OWNER_EMAIL, TEAM_EMAILS } from "@/lib/site";

/**
 * Sending email. SMTP settings come from env vars (SMTP_HOST, SMTP_PORT,
 * SMTP_SECURE, SMTP_USER, SMTP_PASS, LEAD_FROM_EMAIL).
 *
 * Without SMTP_HOST (local runs) nothing is sent: each email is logged, and
 * written as an .html file to EMAIL_PREVIEW_DIR when that is set.
 */

type Message = {
  to: string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || "true") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

async function send(message: Message) {
  if (!transporter) {
    console.log(
      `[email preview] to=${message.to.join(", ")} subject="${message.subject}"`,
    );
    const dir = process.env.EMAIL_PREVIEW_DIR;
    if (dir) {
      await mkdir(dir, { recursive: true });
      const name = `${Date.now()}-${message.subject.replace(/[^a-z0-9]+/gi, "-").slice(0, 60)}.html`;
      await writeFile(join(dir, name), message.html);
    }
    return;
  }
  const from = process.env.LEAD_FROM_EMAIL || process.env.SMTP_USER;
  await transporter.sendMail({
    from: `"Scribebunny" <${from}>`,
    ...message,
    to: message.to.join(", "),
  });
}

/** To the team (TEAM_EMAILS); replies go to the customer when we know them. */
export function sendTeamEmail(message: Omit<Message, "to">) {
  return send({ ...message, to: TEAM_EMAILS });
}

/** To the owner only (OWNER_EMAIL), for things the team doesn't see. */
export function sendOwnerEmail(message: Omit<Message, "to">) {
  return send({ ...message, to: [OWNER_EMAIL] });
}

/** To a customer; replies come back to the studio inbox. */
export function sendCustomerEmail(message: Omit<Message, "replyTo">) {
  return send({ ...message, replyTo: EMAIL });
}
