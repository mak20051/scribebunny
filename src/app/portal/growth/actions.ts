"use server";

import { redirect } from "next/navigation";
import { emailGrowthLink } from "@/lib/growth";

/** From the locked growth page: sends the private link to the owner only. */
export async function emailGrowthLinkAction() {
  const result = await emailGrowthLink();
  redirect(`/portal/growth?sent=${result}`);
}
