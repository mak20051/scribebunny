import { randomBytes, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { brandedEmail } from "@/lib/email-layout";
import { send, type Message } from "@/lib/email";
import { OWNER_EMAIL, PORTAL_URL, TEAM_EMAILS } from "@/lib/site";
import { readJson, updateJson, writeJson } from "@/lib/store";

/**
 * Studio access: every team member has their own private key. Shared word for
 * word by the website (alerts) and the portal app (which checks the keys).
 *
 *   access/team.json   { members: { "<email>": { key, createdAt } } }
 *
 * The team is OWNER_EMAIL plus TEAM_EMAILS (src/lib/site.ts). Each person's key
 * goes only into their own copy of each alert, so links are unique per person:
 *
 *   /portal?k=<key>                 orders dashboard
 *   /portal/<ref>?k=<key>           any order, studio view
 *   /concepts/<id>?k=<key>          concept review
 *   /portal/growth, /portal/access  owner's key only
 *
 * Replacing a key (Team access page) kills that person's old links and nobody
 * else's. Taking an email out of TEAM_EMAILS revokes it. Keys are random, so
 * nothing depends on the Stripe key or any other secret.
 */

type TeamFile = {
  members: Record<string, { key: string; createdAt: string }>;
};

export type Member = {
  email: string;
  key: string;
  createdAt: string;
  owner: boolean;
};

const TEAM_PATH = "access/team.json";
const LINK_COOLDOWN = 5 * 60_000;

export const newKey = () => randomBytes(24).toString("base64url");

export function sameKey(given?: string, expected?: string) {
  if (!given || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const teamEmails = () => [
  ...new Set([OWNER_EMAIL, ...TEAM_EMAILS].map((email) => email.toLowerCase())),
];

const isOwner = (email: string) => email === OWNER_EMAIL.toLowerCase();

/** Every team member with their key; anyone new gets a key on first use. */
export const teamMembers = cache(async (): Promise<Member[]> => {
  const emails = teamEmails();
  let file = (await readJson<TeamFile>(TEAM_PATH))?.value;
  if (!file || emails.some((email) => !file?.members[email])) {
    await writeJson(TEAM_PATH, { members: {} }, { onlyIfNew: true });
    file = await updateJson<TeamFile>(TEAM_PATH, (current) => {
      for (const email of emails) {
        current.members[email] ??= {
          key: newKey(),
          createdAt: new Date().toISOString(),
        };
      }
    });
  }
  const { members } = file;
  return emails.map((email) => ({
    email,
    ...members[email],
    owner: isOwner(email),
  }));
});

/** The team member a link key belongs to, if any. */
export async function memberForKey(key?: string) {
  if (!key) return null;
  return (
    (await teamMembers()).find((member) => sameKey(key, member.key)) ?? null
  );
}

export const dashboardLink = (member: Member) =>
  `${PORTAL_URL}/portal?k=${member.key}`;
export const teamOrderLink = (ref: string, member: Member) =>
  `${PORTAL_URL}/portal/${ref}?k=${member.key}`;
export const conceptReviewLink = (id: string, member: Member) =>
  `${PORTAL_URL}/concepts/${id}?k=${member.key}`;
/** New client portal, filled in from a website package order (Stripe session). */
export const newPortalLink = (sessionId: string, member: Member) =>
  `${PORTAL_URL}/portal/new?k=${member.key}&order=${encodeURIComponent(sessionId)}`;

/** An alert to each team member separately, built with their own links. */
export async function alertTeam(
  build: (member: Member) => Omit<Message, "to">,
) {
  for (const member of await teamMembers()) {
    await send({ ...build(member), to: [member.email] });
  }
}

async function emailDashboardLink(member: Member, replaced: boolean) {
  const link = dashboardLink(member);
  await send({
    to: [member.email],
    subject: replaced
      ? "Your new Scribebunny studio link"
      : "Your Scribebunny studio link",
    html: brandedEmail({
      eyebrow: "Studio access",
      heading: replaced ? "Here's your new studio link" : "Your studio link",
      bodyHtml: `<p>This link is yours alone: it opens every order and concept request${member.owner ? ", plus the growth board and team access" : ""}. Please don't forward it.</p>${replaced ? "<p>Your old link no longer works.</p>" : ""}`,
      preheader: "Your private link to the Scribebunny studio dashboard.",
      button: { label: "Open the studio dashboard", href: link },
      afterButton:
        "Bookmark it. If you didn't ask for this, you can ignore it.",
    }),
    text: `Your private Scribebunny studio link (please don't forward it):\n\n${link}`,
  });
}

/** Email a team member their current link (from the Team access page). */
export async function sendTeamLink(email: string) {
  const member = (await teamMembers()).find(
    (item) => item.email === email.toLowerCase(),
  );
  if (!member) throw new Error("Not on the team.");
  await emailDashboardLink(member, false);
}

/**
 * "Lost your link?": email a team member their current link, at most every
 * 5 minutes. Says nothing about whether the email is on the team.
 */
export async function resendTeamLink(email: string) {
  const member = (await teamMembers()).find(
    (item) => item.email === email.trim().toLowerCase(),
  );
  if (!member) return;
  const path = `access/sent-${member.email.replace(/[^a-z0-9]/g, "_")}.json`;
  const last = await readJson<{ sentAt: string }>(path);
  if (last && Date.now() - Date.parse(last.value.sentAt) < LINK_COOLDOWN)
    return;
  const claimed = await writeJson(
    path,
    { sentAt: new Date().toISOString() },
    last ? { etag: last.etag } : { onlyIfNew: true },
  );
  if (claimed) await emailDashboardLink(member, false);
}

/** Give one person a new key (their old links stop working) and email it. */
export async function replaceTeamKey(email: string): Promise<Member> {
  const target = email.toLowerCase();
  if (!teamEmails().includes(target)) throw new Error("Not on the team.");
  const fresh = { key: newKey(), createdAt: new Date().toISOString() };
  await teamMembers();
  await updateJson<TeamFile>(TEAM_PATH, (current) => {
    current.members[target] = fresh;
  });
  const member = { email: target, ...fresh, owner: isOwner(target) };
  await emailDashboardLink(member, true);
  return member;
}
