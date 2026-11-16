"use client";

import { useEffect } from "react";
import { CLICK_IDS } from "@/lib/lead-source";
import { isPrivatePath } from "@/lib/private-paths";

/**
 * Remembers how this visitor found the site, so every form can say where the
 * lead came from (lib/lead-source.ts names the channel on the server).
 *
 * Kept in this browser only (localStorage "sb_source", 90 days):
 *   first  the first visit
 *   last   the latest visit that had a source (utm tags, an ad click ID or
 *          another site); a later direct visit doesn't replace it
 * No personal data, cookies or IP addresses.
 */

type BrowserTouch = {
  at: string;
  landing: string;
  referrer?: string;
  utm?: Partial<Record<(typeof UTM)[number], string>>;
  click?: string;
};

type Stored = { first?: BrowserTouch; last?: BrowserTouch };

const KEY = "sb_source";
const MAX_AGE = 90 * 86_400_000;
const UTM = ["source", "medium", "campaign", "term", "content"] as const;
// Our own sites and checkout coming back are not a source.
const NOT_A_SOURCE =
  /(^|\.)(scribebunny\.com|stripe\.com|vercel\.app|vercel\.com)$/;

let memory: Stored = {};

function currentTouch(): BrowserTouch {
  const params = new URLSearchParams(window.location.search);
  const utm: BrowserTouch["utm"] = {};
  for (const key of UTM) {
    const value = params.get(`utm_${key}`)?.trim();
    if (value) utm[key] = value.slice(0, 150);
  }
  const click = CLICK_IDS.find((id) => params.get(id));
  let referrer: string | undefined;
  try {
    const host = new URL(document.referrer).hostname.toLowerCase();
    if (host !== window.location.hostname && !NOT_A_SOURCE.test(host)) {
      referrer = host;
    }
  } catch {
    // No referrer.
  }
  return {
    at: new Date().toISOString(),
    landing: window.location.pathname,
    ...(Object.keys(utm).length ? { utm } : {}),
    ...(click ? { click } : {}),
    ...(referrer ? { referrer } : {}),
  };
}

const hasSource = (touch: BrowserTouch) =>
  Boolean(touch.utm || touch.click || touch.referrer);

function load(): Stored {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as Stored;
    if (saved?.last?.at && Date.now() - Date.parse(saved.last.at) < MAX_AGE) {
      return saved;
    }
  } catch {
    // Storage blocked or unreadable: use this page's memory.
  }
  return memory;
}

function recordVisit() {
  const touch = currentTouch();
  const saved = load();
  memory = {
    first: saved.first ?? touch,
    last: hasSource(touch) || !saved.last ? touch : saved.last,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    // Kept in memory for this page.
  }
}

/** Sent with every form: how this visitor found the site, and this page. */
export function getLeadSource() {
  let saved = load();
  if (!saved.last) {
    recordVisit();
    saved = memory;
  }
  return { ...saved, page: window.location.pathname };
}

export function LeadSourceTracker() {
  useEffect(() => {
    // Runs once per page load (the layout stays mounted between pages).
    if (!isPrivatePath(window.location.pathname)) recordVisit();
  }, []);
  return null;
}
