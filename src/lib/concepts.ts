import { randomBytes } from "node:crypto";
import { alertTeam, conceptReviewLink } from "@/lib/access";
import { sendCustomerEmail } from "@/lib/email";
import {
  alertEmail,
  alertText,
  brandedEmail,
  escapeHtml,
} from "@/lib/email-layout";
import { formatUsd, VIDEO_SPEC, videoPackages } from "@/lib/packages";
import { researchWebsite, type WebsiteResearch } from "@/lib/research";
import { CALENDLY_URL, SITE_URL } from "@/lib/site";
import { listPaths, readJson, updateJson, writeJson } from "@/lib/store";
import type { ProspectFollowUps } from "@/lib/prospect-follow-ups";

/**
 * Free 3-concept offer: a prospect asks, we research their website, DeepSeek
 * drafts three video concepts, and the studio reviews them before they go out.
 *
 *   form ─▶ requestConcepts()  ── store: concepts/<id>.json
 *             ├─▶ team alert (review link) + prospect "on the drawing board" email
 *             └─▶ draftConcepts() in the background
 *                    website research ─▶ DeepSeek (JSON) ─▶ status "review"
 *                    └─▶ team "ready to review" alert
 *   review page ─▶ edit ─▶ sendConcepts() ─▶ branded concepts email to the prospect
 *
 * Without DEEPSEEK_API_KEY the request still lands, the draft step reports why,
 * and the team writes the concepts by hand on the review page.
 */

export const CONCEPT_STYLES = ["Whiteboard", "2D animation"] as const;

export type Concept = {
  title: string;
  style: string;
  hook: string;
  story: string[];
  visuals: string;
  whyItFits: string;
};

export type ConceptStatus = "drafting" | "review" | "sent" | "failed";

export type ConceptRequest = {
  id: string;
  createdAt: string;
  status: ConceptStatus;
  lead: {
    name: string;
    email: string;
    phone: string;
    website?: string;
    details?: string;
  };
  research?: Pick<WebsiteResearch, "url" | "title" | "description">;
  concepts: Concept[];
  note?: string;
  sentAt?: string;
  /** Reminders after the concepts went out (lib/prospect-follow-ups.ts). */
  followUps?: ProspectFollowUps;
};

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-flash";

const requestPath = (id: string) => `concepts/${id}.json`;

/**
 * Automatic drafting (website research + DeepSeek) is paused until
 * DEEPSEEK_API_KEY is set: new requests start as "Needs writing", nothing is
 * drafted, and the team gets only the request alert.
 */
export const autoDraftOn = () => Boolean(process.env.DEEPSEEK_API_KEY);

export async function getConceptRequest(id: string) {
  if (!/^C-[A-Z0-9]{8}$/.test(id)) return null;
  return (await readJson<ConceptRequest>(requestPath(id)))?.value ?? null;
}

/** Change a request and save it, retrying if someone else saved first. */
export const updateConceptRequest = (
  id: string,
  change: (request: ConceptRequest) => void,
) => updateJson<ConceptRequest>(requestPath(id), change);

/** Every concept request, newest first. */
export async function listConceptRequests() {
  const paths = await listPaths("concepts/");
  const requests = await Promise.all(
    paths.map(async (path) => (await readJson<ConceptRequest>(path))?.value),
  );
  return requests
    .filter((request): request is ConceptRequest => Boolean(request))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function newId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return `C-${[...randomBytes(8)].map((byte) => alphabet[byte % alphabet.length]).join("")}`;
}

/** Record a new request, tell the team, and confirm receipt to the prospect. */
export async function requestConcepts(lead: ConceptRequest["lead"]) {
  const request: ConceptRequest = {
    id: newId(),
    createdAt: new Date().toISOString(),
    status: autoDraftOn() ? "drafting" : "failed",
    lead,
    concepts: [],
  };
  await writeJson(requestPath(request.id), request, { onlyIfNew: true });

  const title = `Free concepts request from ${lead.name}`;
  const fields = leadFields(request);
  await alertTeam((member) => ({
    subject: `🎨 ${title}`,
    html: alertEmail({
      title,
      fields,
      tone: "lead",
      link: {
        label: "Review the concepts",
        href: conceptReviewLink(request.id, member),
      },
    }),
    text: `${alertText(title, fields)}\n\nReview: ${conceptReviewLink(request.id, member)}`,
    replyTo: lead.email,
  }));
  await sendCustomerEmail({
    to: [lead.email],
    subject: "We've received your request",
    html: brandedEmail({
      eyebrow: "Free concepts",
      heading: "We've received your request",
      bodyHtml: `<p>Hi ${escapeHtml(firstName(lead.name))},</p>
<p>Thanks for asking Scribebunny for free video concepts. We've received your request, and our team will be in touch soon.</p>`,
      preheader: "Thanks! We've received your request.",
      button: { label: "See videos we've made", href: `${SITE_URL}/work` },
      afterButton: "Questions in the meantime? Just reply to this email.",
    }),
    text: `Hi ${firstName(lead.name)},\n\nThanks for asking Scribebunny for free video concepts. We've received your request, and our team will be in touch soon.\n\nThe Scribebunny studio`,
  });
  return request;
}

/** Research the website and ask DeepSeek for three concepts. Safe to run again. */
export async function draftConcepts(id: string) {
  const request = await getConceptRequest(id);
  if (!request) return;

  let research: WebsiteResearch | undefined;
  const notes: string[] = [];
  if (request.lead.website) {
    try {
      research = await researchWebsite(request.lead.website);
    } catch (error) {
      notes.push(
        `Couldn't read the website (${(error as Error).message}). Drafted from the details only.`,
      );
    }
  }

  let concepts: Concept[] = [];
  try {
    concepts = await askDeepSeek(request, research);
  } catch (error) {
    notes.push(
      `Draft failed: ${(error as Error).message}. Write the concepts below, or try drafting again.`,
    );
  }

  const updated = await updateJson<ConceptRequest>(
    requestPath(id),
    (current) => {
      current.research = research
        ? {
            url: research.url,
            title: research.title,
            description: research.description,
          }
        : current.research;
      if (concepts.length) current.concepts = concepts;
      current.status = concepts.length
        ? current.status === "sent"
          ? "sent"
          : "review"
        : current.concepts.length
          ? current.status
          : "failed";
      current.note = notes.join(" ") || undefined;
    },
  );

  const title = concepts.length
    ? `3 concepts ready to review for ${updated.lead.name}`
    : `Concepts need writing for ${updated.lead.name}`;
  const fields: [string, string | undefined][] = [
    ["Request", updated.id],
    ["Business", updated.research?.title ?? updated.lead.website],
    ["Note", notes.join(" ") || undefined],
    ...concepts.map(
      (concept, index) =>
        [`Concept ${index + 1}`, `${concept.title} (${concept.style})`] as [
          string,
          string,
        ],
    ),
  ];
  await alertTeam((member) => ({
    subject: `${concepts.length ? "✅" : "⚠️"} ${title}`,
    html: alertEmail({
      title,
      fields,
      tone: "lead",
      link: {
        label: "Review and send",
        href: conceptReviewLink(updated.id, member),
      },
    }),
    text: `${alertText(title, fields)}\n\nReview: ${conceptReviewLink(updated.id, member)}`,
  }));
}

async function askDeepSeek(
  request: ConceptRequest,
  research?: WebsiteResearch,
): Promise<Concept[]> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY is not set");

  const material = [
    `Business contact: ${request.lead.name}`,
    request.lead.website && `Website: ${request.lead.website}`,
    request.lead.details && `What they told us: ${request.lead.details}`,
    research?.title && `Website title: ${research.title}`,
    research?.description && `Website description: ${research.description}`,
    research?.headings.length &&
      `Website headings:\n- ${research.headings.join("\n- ")}`,
    research?.text && `Website text (excerpt):\n${research.text}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    signal: AbortSignal.timeout(110_000),
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      reasoning_effort: "low",
      response_format: { type: "json_object" },
      max_tokens: 6000,
      messages: [
        {
          role: "system",
          content: `You are the head storyteller at Scribebunny, a small animation studio that loves to draw and tell stories. You write concepts for short animated explainer videos (${VIDEO_SPEC.length}) in a hand-drawn whiteboard or 2D animation style.

Ground every concept in the business's own website and the details they shared: their offer, their audience, and the words they use. Never invent facts that are not in the material (no made-up prices, statistics, client names, awards, or features). If the material is thin, keep claims general rather than inventing specifics.

Reply with JSON only, in exactly this shape:
{"concepts":[{"title":"","style":"Whiteboard or 2D animation","hook":"","story":["",""],"visuals":"","whyItFits":""}]}`,
        },
        {
          role: "user",
          content: `${material}

Write exactly 3 concepts, each taking a clearly different angle (for example: a customer's problem told as a story, a simple walkthrough of how it works, and a bold brand or vision piece).
- title: up to 8 words
- style: "Whiteboard" or "2D animation", whichever suits the concept
- hook: the opening line the viewer hears, one sentence
- story: 4 or 5 beats, each one sentence describing what we see and hear
- visuals: one or two sentences on the look and feel
- whyItFits: one or two sentences, written to the business owner as "you" and "your", pointing to something specific from their website or details

Write everything for the business owner to read. Use plain, warm language.`,
        },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(`DeepSeek answered ${response.status}`);
  }
  const data = (await response.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned no content");
  const parsed = JSON.parse(content) as { concepts?: Partial<Concept>[] };
  const concepts = (parsed.concepts ?? [])
    .map((concept) => ({
      title: String(concept.title ?? "").trim(),
      style: CONCEPT_STYLES.includes(concept.style as never)
        ? String(concept.style)
        : "2D animation",
      hook: String(concept.hook ?? "").trim(),
      story: (Array.isArray(concept.story) ? concept.story : [])
        .map((beat) => String(beat).trim())
        .filter(Boolean),
      visuals: String(concept.visuals ?? "").trim(),
      whyItFits: String(concept.whyItFits ?? "").trim(),
    }))
    .filter((concept) => concept.title && concept.hook && concept.story.length);
  if (concepts.length < 3)
    throw new Error("DeepSeek returned fewer than 3 concepts");
  return concepts.slice(0, 3);
}

export async function saveConcepts(id: string, concepts: Concept[]) {
  return updateJson<ConceptRequest>(requestPath(id), (current) => {
    current.concepts = concepts;
    if (current.status === "failed" || current.status === "drafting") {
      current.status = "review";
    }
  });
}

/** Email the reviewed concepts to the prospect. */
export async function sendConcepts(id: string) {
  const request = await getConceptRequest(id);
  if (!request) throw new Error(`No concept request ${id}`);
  if (request.concepts.length < 3) {
    throw new Error("Write all 3 concepts before sending");
  }
  const single = videoPackages[0];
  const site = request.research?.url ?? request.lead.website;

  await sendCustomerEmail({
    to: [request.lead.email],
    subject: "Your 3 video concepts from Scribebunny",
    html: brandedEmail({
      eyebrow: "Free concepts",
      heading: "Three stories, drawn from your business",
      bodyHtml: `<p>Hi ${escapeHtml(firstName(request.lead.name))},</p>
<p>Here are your three video concepts. ${
        site
          ? `We started by reading <strong>${escapeHtml(site)}</strong>`
          : "We started with"
      }${site && request.lead.details ? " and the notes you sent us" : site ? "" : " the notes you sent us"}, so each one is built around what you actually offer, who you serve, and the way you talk about it.</p>
${request.concepts.map(conceptHtml).join("")}
<p><strong>Why this is more than an AI chat answer</strong></p>
<ul style="margin:0 0 16px;padding-left:20px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#4A5568">
<li style="margin:0 0 6px"><strong>Researched, not guessed.</strong> We read your website and your notes first, so the concepts use your real offer and audience instead of generic filler.</li>
<li style="margin:0 0 6px"><strong>Built like a real video.</strong> Each concept has an opening hook, a scene-by-scene story, and a visual style, ready to become an animation ${escapeHtml(VIDEO_SPEC.length)} long.</li>
<li style="margin:0 0 6px"><strong>Reviewed by our storytellers.</strong> A person on our team checked every concept before it reached you.</li>
</ul>
<p>Love one of them? Reply with its number and we'll turn it into your video. A single video is ${formatUsd(single.priceCents)}, ${escapeHtml(single.turnaround.toLowerCase())}, with ${escapeHtml(VIDEO_SPEC.revisions)}.</p>`,
      preheader: "Three researched video concepts for your business.",
      button: {
        label: "Turn a concept into a video",
        href: `${SITE_URL}/#pricing`,
      },
      afterButton: `Or book a free strategy call: ${CALENDLY_URL}`,
    }),
    text: [
      `Hi ${firstName(request.lead.name)},`,
      "",
      "Here are your three video concepts, researched from your website and the details you shared, and reviewed by our storytellers.",
      "",
      ...request.concepts.map(
        (concept, index) =>
          `${index + 1}. ${concept.title} (${concept.style})\nHook: ${concept.hook}\n${concept.story.map((beat) => `- ${beat}`).join("\n")}\nLook: ${concept.visuals}\nWhy it fits: ${concept.whyItFits}\n`,
      ),
      `Love one? Reply with its number, or order at ${SITE_URL}/#pricing`,
      "",
      "The Scribebunny studio",
    ].join("\n"),
  });

  return updateJson<ConceptRequest>(requestPath(id), (current) => {
    current.status = "sent";
    current.sentAt = new Date().toISOString();
  });
}

function conceptHtml(concept: Concept, index: number) {
  const beats = concept.story
    .map((beat) => `<li style="margin:0 0 4px">${escapeHtml(beat)}</li>`)
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;border:2px solid #2D3748;border-radius:14px;border-collapse:separate">
<tr><td style="background:#FFE66D;border-radius:12px 12px 0 0;padding:12px 18px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <span style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#2D3748">Concept ${index + 1} · ${escapeHtml(concept.style)}</span><br>
  <span style="font-size:19px;font-weight:800;color:#2D3748">${escapeHtml(concept.title)}</span>
</td></tr>
<tr><td style="padding:14px 18px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#4A5568">
  <p style="margin:0 0 10px"><strong style="color:#2D3748">Hook:</strong> &ldquo;${escapeHtml(concept.hook)}&rdquo;</p>
  <ol style="margin:0 0 10px;padding-left:20px">${beats}</ol>
  <p style="margin:0 0 8px"><strong style="color:#2D3748">The look:</strong> ${escapeHtml(concept.visuals)}</p>
  <p style="margin:0"><strong style="color:#2D3748">Why it fits you:</strong> ${escapeHtml(concept.whyItFits)}</p>
</td></tr></table>`;
}

function leadFields(request: ConceptRequest): [string, string | undefined][] {
  return [
    ["Request", request.id],
    ["Name", request.lead.name],
    ["Email", request.lead.email],
    ["Phone", request.lead.phone],
    ["Website", request.lead.website],
    ["Details", request.lead.details],
  ];
}

export const firstName = (name: string) => name.trim().split(" ")[0] || "there";
