"use client";

import { useEffect } from "react";

export function LiveChat() {
  useEffect(() => {
    if (document.getElementById("tcx-callus-js")) return;
    const script = document.createElement("script");
    script.id = "tcx-callus-js";
    script.src =
      "https://downloads-global.3cx.com/downloads/livechatandtalk/v1/callus.js";
    script.charset = "utf-8";
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <call-us-selector phonesystem-url="https://pbxvoip.3cx.us" party="LiveChat842689"></call-us-selector>
        `,
      }}
    />
  );
}
