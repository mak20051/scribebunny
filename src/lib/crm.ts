import { SITE_URL } from "@/lib/site";

const CRM_FORM_URL =
  "https://aimviz-nextjs.vercel.app/api/crm/forms/3f2fff02e86860bc5bc23fc318ebc9a62f0abb58eadea70b9c11daf94267a46c/submit";

/**
 * Copy a lead into the aimviz CRM. Failures are logged, never thrown.
 * Only the live site sends: local runs and preview deploys would add test
 * leads to the real CRM.
 */
export async function forwardToCrm(lead: {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  message?: string;
}) {
  if (process.env.VERCEL_ENV !== "production") {
    console.log("[crm] not sent outside production:", lead.email, lead.message);
    return;
  }
  await fetch(CRM_FORM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: lead.name ?? "",
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      company: lead.website ?? "",
      message: lead.message ?? "",
      source_url: SITE_URL,
    }),
  }).catch((error) => console.error("CRM forward failed", error));
}
