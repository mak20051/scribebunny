import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { verticals } from "@/lib/verticals";

/**
 * lastModified is the date the page content last changed, not the build time.
 * Bump the date when you change a page. Vertical pages carry their own date in
 * src/lib/verticals.ts.
 */
const corePages: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    lastModified: "2026-11-17",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${SITE_URL}/work`,
    lastModified: "2026-11-17",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/free-concepts`,
    lastModified: "2026-11-17",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/contact`,
    lastModified: "2026-10-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...corePages,
    ...verticals.map((vertical) => ({
      url: `${SITE_URL}/${vertical.slug}`,
      lastModified: vertical.lastModified,
      changeFrequency: vertical.changeFrequency,
      priority: vertical.priority,
    })),
  ];
}
