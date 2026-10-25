import type { MetadataRoute } from "next";
import { PRIVATE_PATHS } from "@/lib/private-paths";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // A crawler follows only its own group, so every group repeats the private paths.
      ...[
        "*",
        "GPTBot",
        "OAI-SearchBot",
        "ClaudeBot",
        "PerplexityBot",
        "Google-Extended",
      ].map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
