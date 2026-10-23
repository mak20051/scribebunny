"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const GA_ID = "G-MX1GLDERW4";

declare function gtag(...args: unknown[]): void;

function GoogleAnalyticsTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const loader = document.createElement("script");
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(loader);

    const init = document.createElement("script");
    init.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
    `;
    document.head.appendChild(init);
  }, []);

  useEffect(() => {
    const pathname = window.location.pathname;
    const query = searchParams?.toString() || "";
    const pagePath = pathname + (query ? `?${query}` : "");
    if (typeof gtag === "function") {
      gtag("config", GA_ID, { page_path: pagePath });
    }
  }, [searchParams]);

  return null;
}

export function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsTracker />
    </Suspense>
  );
}
