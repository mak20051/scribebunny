"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isPrivatePath } from "@/lib/private-paths";

export function LiveChat() {
  // Not on private pages: the portal has its own messages, and the other
  // private addresses carry keys that a third-party widget should not see.
  const hidden = isPrivatePath(usePathname());

  useEffect(() => {
    if (hidden || document.getElementById("tcx-callus-js")) return;
    const script = document.createElement("script");
    script.id = "tcx-callus-js";
    script.src =
      "https://downloads-global.3cx.com/downloads/livechatandtalk/v1/callus.js";
    script.charset = "utf-8";
    script.defer = true;
    document.head.appendChild(script);
  }, [hidden]);

  if (hidden) return null;

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
