"use server";

import { revalidatePath } from "next/cache";
import {
  filesFolder,
  MAX_FILES_PER_MESSAGE,
  type Attachment,
} from "@/lib/attachments";
import { fileInfo, portalPath } from "@/lib/store";
import { saveReview, toggleLaunchStep } from "@/lib/launch";
import { redirect } from "next/navigation";
import {
  memberForKey,
  replaceTeamKey,
  resendTeamLink,
  sendTeamLink,
} from "@/lib/access";
import {
  addMessage,
  DEMO_REF,
  openOrder,
  replaceClientKey,
  resetDemo,
  setOrderStatus,
  updateVideo,
  VIDEO_STATUSES,
  type VideoStatus,
} from "@/lib/portal";

function field(formData: FormData, name: string, max: number) {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, max);
}

/** Every action re-checks the link key: server actions are public endpoints. */
async function authorize(formData: FormData, needTeam = false) {
  const ref = field(formData, "ref", 40);
  const opened = await openOrder(ref, field(formData, "k", 64));
  if (!opened || (needTeam && opened.role !== "team")) {
    throw new Error("This portal link is not allowed to do that.");
  }
  return { ref, role: opened.role };
}

/** The owner's key, checked again for every owner-only action. */
async function authorizeOwner(formData: FormData) {
  const key = field(formData, "k", 64);
  const member = await memberForKey(key);
  if (!member?.owner) throw new Error("Only the owner can do that.");
  return member;
}

export async function postMessageAction(formData: FormData) {
  const { ref, role } = await authorize(formData);
  const message = field(formData, "message", 4000);
  const attachments = await readAttachments(formData, ref);
  if (!message && !attachments.length) return;
  await addMessage(ref, role, message, attachments);
  revalidatePath(`/portal/${ref}`);
}

/** Files the browser says it uploaded: each must be in this order's folder and really there. */
async function readAttachments(formData: FormData, ref: string) {
  let claimed: unknown;
  try {
    claimed = JSON.parse(String(formData.get("attachments") ?? "[]"));
  } catch {
    claimed = [];
  }
  if (!Array.isArray(claimed)) return [];
  const attachments: Attachment[] = [];
  for (const item of claimed.slice(0, MAX_FILES_PER_MESSAGE)) {
    const { pathname, name } = (item ?? {}) as {
      pathname?: unknown;
      name?: unknown;
    };
    const path = typeof pathname === "string" ? portalPath(pathname) : null;
    if (!path || !path.startsWith(filesFolder(ref)) || path.includes("..")) {
      throw new Error("That file isn't part of this project.");
    }
    const info = await fileInfo(path);
    if (!info)
      throw new Error(
        "A file didn't finish uploading. Please attach it again.",
      );
    attachments.push({
      path,
      name: String(name ?? "").slice(0, 120) || "file",
      size: info.size,
      contentType: info.contentType,
    });
  }
  return attachments;
}

export async function updateVideoAction(formData: FormData) {
  const { ref } = await authorize(formData, true);
  const status = field(formData, "status", 40);
  const deliveryUrl = field(formData, "deliveryUrl", 500);
  if (!VIDEO_STATUSES.includes(status as VideoStatus)) {
    throw new Error("Unknown video status.");
  }
  if (deliveryUrl && !/^https?:\/\/\S+$/.test(deliveryUrl)) {
    throw new Error("The delivery link must start with http:// or https://.");
  }
  await updateVideo(ref, Number(field(formData, "number", 4)), {
    title: field(formData, "title", 120) || undefined,
    status: status as VideoStatus,
    deliveryUrl,
  });
  revalidatePath(`/portal/${ref}`);
}

export async function setOrderStatusAction(formData: FormData) {
  const { ref } = await authorize(formData, true);
  const status = field(formData, "status", 20);
  if (status !== "active" && status !== "complete") {
    throw new Error("Unknown order status.");
  }
  await setOrderStatus(ref, status);
  revalidatePath(`/portal/${ref}`);
}

/** Demo project only: back to the sample data. */
export async function resetDemoAction() {
  await resetDemo();
  revalidatePath(`/portal/${DEMO_REF}`);
}

/** Studio view: a new private link for the client; the old one stops working. */
export async function replaceClientLinkAction(formData: FormData) {
  const { ref } = await authorize(formData, true);
  await replaceClientKey(ref);
  revalidatePath(`/portal/${ref}`);
}

/** "Lost your link?" on the locked dashboard. */
export async function resendTeamLinkAction(formData: FormData) {
  await resendTeamLink(field(formData, "email", 200));
  redirect("/portal?sent=1");
}

/** Team access page: email a person their current link. */
export async function sendTeamLinkAction(formData: FormData) {
  const owner = await authorizeOwner(formData);
  const email = field(formData, "email", 200);
  await sendTeamLink(email);
  redirect(
    `/portal/access?k=${owner.key}&done=sent&who=${encodeURIComponent(email)}`,
  );
}

/** Team access page: replace a person's key, so their old links stop working. */
export async function replaceTeamKeyAction(formData: FormData) {
  const owner = await authorizeOwner(formData);
  const email = field(formData, "email", 200);
  const member = await replaceTeamKey(email);
  const key = member.email === owner.email ? member.key : owner.key;
  redirect(
    `/portal/access?k=${key}&done=replaced&who=${encodeURIComponent(email)}`,
  );
}

/** Launch checklist: the client ticks or unticks a step. */
export async function toggleLaunchStepAction(formData: FormData) {
  const { ref, role } = await authorize(formData);
  if (role !== "client")
    throw new Error("Only the client ticks their checklist.");
  await toggleLaunchStep(ref, field(formData, "step", 40));
  revalidatePath(`/portal/${ref}`);
}

/** The client's review, in their own words. */
export async function submitReviewAction(formData: FormData) {
  const { ref, role } = await authorize(formData);
  if (role !== "client") throw new Error("Only the client can leave a review.");
  const rating = Number(field(formData, "rating", 1));
  const quote = field(formData, "quote", 1200);
  const name = field(formData, "name", 120);
  if (!(rating >= 1 && rating <= 5) || !quote || !name) {
    throw new Error("Please add a rating, a few words and your name.");
  }
  await saveReview(ref, {
    rating,
    quote,
    name,
    role: field(formData, "role", 120) || undefined,
    company: field(formData, "company", 120) || undefined,
    canFeature: formData.get("canFeature") === "on",
  });
  revalidatePath(`/portal/${ref}`);
}
