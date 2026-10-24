import { randomBytes } from "node:crypto";
import { listPaths, readJson, writeJson } from "@/lib/store";

/**
 * Contact, quote, and agency form leads, kept so the growth board can count
 * them (they are also emailed to the team and copied to the CRM).
 *
 *   store: leads/<id>.json
 */

export type StoredLead = {
  id: string;
  createdAt: string;
  type: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
};

export async function recordLead(lead: Omit<StoredLead, "id" | "createdAt">) {
  const record: StoredLead = {
    id: `L-${randomBytes(6).toString("hex").toUpperCase()}`,
    createdAt: new Date().toISOString(),
    ...lead,
  };
  await writeJson(`leads/${record.id}.json`, record, { onlyIfNew: true });
}

export async function listLeads() {
  const paths = await listPaths("leads/");
  const leads = await Promise.all(
    paths.map(async (path) => (await readJson<StoredLead>(path))?.value),
  );
  return leads.filter((lead): lead is StoredLead => Boolean(lead));
}
