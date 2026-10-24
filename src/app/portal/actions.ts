"use server";

import { revalidatePath } from "next/cache";
import {
  addMessage,
  DEMO_REF,
  resetDemo,
  roleFor,
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
function authorize(formData: FormData, needTeam = false) {
  const ref = field(formData, "ref", 40);
  const role = roleFor(ref, field(formData, "k", 64));
  if (!role || (needTeam && role !== "team")) {
    throw new Error("This portal link is not allowed to do that.");
  }
  return { ref, role };
}

export async function postMessageAction(formData: FormData) {
  const { ref, role } = authorize(formData);
  const message = field(formData, "message", 4000);
  if (!message) return;
  await addMessage(ref, role, message);
  revalidatePath(`/portal/${ref}`);
}

export async function updateVideoAction(formData: FormData) {
  const { ref } = authorize(formData, true);
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
  const { ref } = authorize(formData, true);
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
