"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { isPrivatePath } from "@/lib/private-paths";

const PIXEL_ID = "133832099812863";

/** Not on private pages: their addresses carry portal keys and order details. */
export function FacebookPixel() {
  const pathname = usePathname();
  const skip = isPrivatePath(pathname);

  // The Pixel's own history tracking fires on pushState, before React can
  // react, so it would send a private address. It is switched off
  // (disablePushState) and client-side page views are sent here, public pages
  // only. Consent is also revoked while on a private page.
  const first = useRef(true);
  useEffect(() => {
    const fbq = (window as { fbq?: (...args: unknown[]) => void }).fbq;
    if (!fbq) return;
    fbq("consent", skip ? "revoke" : "grant");
    if (!skip && !first.current) fbq("track", "PageView");
  }, [skip, pathname]);

  useEffect(() => {
    first.current = false;
    if (skip || (window as { fbq?: unknown }).fbq) return;
    const script = document.createElement("script");
    script.nonce = PIXEL_ID;
    script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq.disablePushState = true;
        fbq('init', '${PIXEL_ID}');
        fbq('track', 'PageView');
      `;
    document.head.appendChild(script);

    const noscript = document.createElement("noscript");
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1" />`;
    document.body.appendChild(noscript);
  }, [skip]);

  return null;
}
