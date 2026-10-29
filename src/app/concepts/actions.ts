"use server";

import { revalidatePath } from "next/cache";
import { memberForKey } from "@/lib/access";
import {
  autoDraftOn,
  CONCEPT_STYLES,
  draftConcepts,
  saveConcepts,
  sendConcepts,
  type Concept,
} from "@/lib/concepts";
import { stopByTeam } from "@/lib/prospect-follow-ups";

function field(formData: FormData, name: string, max: number) {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, max);
}

/** Server actions are public endpoints, so every one re-checks the team key. */
async function authorize(formData: FormData) {
  const id = field(formData, "id", 20);
  if (!(await memberForKey(field(formData, "k", 64)))) {
    throw new Error("This review link is not allowed to do that.");
  }
  return id;
}

function readConcepts(formData: FormData): Concept[] {
  return [0, 1, 2].map((index) => {
    const style = field(formData, `style-${index}`, 40);
    return {
      title: field(formData, `title-${index}`, 120),
      style: CONCEPT_STYLES.includes(style as never) ? style : "2D animation",
      hook: field(formData, `hook-${index}`, 400),
      story: field(formData, `story-${index}`, 3000)
        .split("\n")
        .map((beat) => beat.replace(/^[-•\d.)\s]+/, "").trim())
        .filter(Boolean),
      visuals: field(formData, `visuals-${index}`, 600),
      whyItFits: field(formData, `why-${index}`, 600),
    };
  });
}

export async function saveConceptsAction(formData: FormData) {
  const id = await authorize(formData);
  await saveConcepts(id, readConcepts(formData));
  revalidatePath(`/concepts/${id}`);
}

export async function sendConceptsAction(formData: FormData) {
  const id = await authorize(formData);
  const concepts = readConcepts(formData);
  await saveConcepts(id, concepts);
  const incomplete = concepts.some(
    (concept) => !concept.title || !concept.hook || !concept.story.length,
  );
  if (incomplete) {
    throw new Error("Every concept needs a title, a hook, and a story.");
  }
  await sendConcepts(id);
  revalidatePath(`/concepts/${id}`);
}

export async function redraftConceptsAction(formData: FormData) {
  const id = await authorize(formData);
  if (!autoDraftOn()) throw new Error("Automatic drafting is paused.");
  await draftConcepts(id);
  revalidatePath(`/concepts/${id}`);
}

/** The prospect replied or booked a call: no more reminders. */
export async function stopFollowUpsAction(formData: FormData) {
  const id = await authorize(formData);
  const member = await memberForKey(field(formData, "k", 64));
  await stopByTeam(id, member?.email);
  revalidatePath(`/concepts/${id}`);
}
