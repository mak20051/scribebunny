"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { isPrivatePath } from "@/lib/private-paths";
import { CALENDLY_URL } from "@/lib/site";
import { findVideoPackage } from "@/lib/packages";

const GA_ID = "G-MX1GLDERW4";
const LEAD_FORMS = ["contact", "agency", "free_concepts"];

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean | undefined;
};

const gw = () => window as unknown as GtagWindow;

/** Safe to call before GA has loaded: it queues on dataLayer. */
export function gtag(...args: unknown[]) {
  const w = gw();
  w.dataLayer = w.dataLayer || [];
  // gtag.js needs an `arguments` object on the dataLayer, not an array.
  const push = function () {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  push(...(args as []));
}

/** Never send events from private pages (their addresses carry keys). */
const onPrivatePage = () => isPrivatePath(window.location.pathname);

/**
 * Only /thank-you keeps a query param, and only a known form name: no other
 * query string (?k=, session_id=, UTMs, ...) is ever sent to GA.
 */
function pageLocation(pathname: string) {
  let location = window.location.origin + pathname;
  if (pathname === "/thank-you") {
    const form = new URLSearchParams(window.location.search).get("form");
    if (form && LEAD_FORMS.includes(form)) location += `?form=${form}`;
  }
  return location;
}

/** Package name for a checkout button, read from the DOM (no component edits). */
function checkoutPackage(button: HTMLElement) {
  const card = button.closest("article.pricing-card");
  const cardName = card?.querySelector("h3")?.textContent?.trim();
  if (cardName) return cardName;
  if (/^order a video/i.test(button.textContent?.trim() ?? "")) {
    return findVideoPackage("single")?.name;
  }
  return undefined;
}

function onDocumentClick(event: MouseEvent) {
  if (onPrivatePage() || !(event.target instanceof Element)) return;
  const page_path = window.location.pathname;

  const link = event.target.closest("a[href]");
  if (link) {
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith(CALENDLY_URL)) {
      gtag("event", "book_call_click", { page_path });
    } else if (/^tel:/i.test(href)) {
      gtag("event", "phone_click", { page_path });
    } else if (/^mailto:/i.test(href)) {
      gtag("event", "email_click", { page_path });
    }
    return;
  }

  // Checkout buttons are <button type="button"> inside a pricing card, or the
  // "Order a Video" hero button. No stable attribute exists without editing
  // checkout-button.tsx, so match on that structure and label.
  const button = event.target.closest<HTMLElement>("button[type='button']");
  if (!button) return;
  const label = button.textContent?.trim() ?? "";
  const inPricingCard = !!button.closest("article.pricing-card");
  if (inPricingCard || /^order a video/i.test(label)) {
    gtag("event", "begin_checkout", {
      package_name: checkoutPackage(button),
      page_path,
    });
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const loaded = useRef(false);
  const privatePage = isPrivatePath(pathname);

  // Load GA only on public pages. Once loaded it stays, so a client-side move
  // to a private page switches it off with GA's own opt-out flag.
  useEffect(() => {
    gw()[`ga-disable-${GA_ID}`] = privatePage;
    if (privatePage || loaded.current) return;
    loaded.current = true;
    gtag("js", new Date());
    gtag("config", GA_ID, { send_page_view: false });
    const loader = document.createElement("script");
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(loader);
  }, [privatePage]);

  // Page views: path only, never the query string (except form on /thank-you).
  useEffect(() => {
    if (privatePage) return;
    gtag("event", "page_view", {
      page_location: pageLocation(pathname),
      page_path: pathname,
      page_title: document.title,
    });
  }, [pathname, privatePage]);

  // generate_lead for the two forms that redirect to /thank-you.
  useEffect(() => {
    if (pathname !== "/thank-you") return;
    const form = new URLSearchParams(window.location.search).get("form");
    if (!form || !LEAD_FORMS.includes(form)) return;
    gtag("event", "generate_lead", { form });
    // Drop the param so a reload does not count the lead twice.
    window.history.replaceState(null, "", "/thank-you");
  }, [pathname]);

  useEffect(() => {
    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, []);

  return null;
}
