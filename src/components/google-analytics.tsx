"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { isPrivatePath } from "@/lib/private-paths";
import { CALENDLY_URL } from "@/lib/site";
import { videoPackages } from "@/lib/packages";

const GA_ID = "G-MX1GLDERW4";
const LEAD_FORMS = ["contact", "agency", "free_concepts", "quote"];
// Campaign tags GA4 needs for attribution; every other param is dropped.
const KEEP_PARAMS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "utm_id", "gclid", "gbraid", "wbraid", "msclkid",
];

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
 * page_view location: path + campaign tags (utm_*, click IDs) only, plus the
 * form name on /thank-you. Any other param (?k=, session_id=, ...) is dropped.
 * This covers the page_views this code sends, not gtag's own automatic events.
 */
function pageLocation(pathname: string) {
  const current = new URLSearchParams(window.location.search);
  const kept = new URLSearchParams();
  for (const key of KEEP_PARAMS) {
    const value = current.get(key);
    if (value) kept.set(key, value);
  }
  if (pathname === "/thank-you") {
    const form = current.get("form");
    if (form && LEAD_FORMS.includes(form)) kept.set("form", form);
  }
  const query = kept.toString();
  return window.location.origin + pathname + (query ? `?${query}` : "");
}

/** The package behind a checkout button, read from the DOM (no component edits). */
function checkoutPackage(button: HTMLElement) {
  const card = button.closest("article.pricing-card");
  const cardName = card?.querySelector("h3")?.textContent?.trim();
  if (cardName) return videoPackages.find((item) => item.name === cardName);
  if (/^order a video/i.test(button.textContent?.trim() ?? "")) {
    return videoPackages.find((item) => item.id === "single");
  }
  return undefined;
}

function onDocumentClick(event: MouseEvent) {
  if (onPrivatePage() || !(event.target instanceof Element)) return;

  const link = event.target.closest("a[href]");
  if (link) {
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith(CALENDLY_URL)) {
      gtag("event", "book_call_click");
    } else if (/^tel:/i.test(href)) {
      gtag("event", "phone_click");
    } else if (/^mailto:/i.test(href)) {
      gtag("event", "email_click");
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
    const item = checkoutPackage(button);
    gtag("event", "begin_checkout", {
      package_name: item?.name,
      currency: "USD",
      value: item ? item.priceCents / 100 : undefined,
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
      page_title: document.title,
    });
  }, [pathname, privatePage]);

  useEffect(() => {
    // Capture phase: runs before React re-renders the clicked button's label.
    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, []);

  return null;
}
