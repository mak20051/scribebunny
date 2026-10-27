import type { NextConfig } from "next";
import { PRIVATE_PATHS } from "./src/lib/private-paths";

/** Private pages: never indexed, cached by search engines, or named in a Referer. */
const privateHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
  { key: "Referrer-Policy", value: "no-referrer" },
];

/** Client portals and concept reviews live in their own app (scribebunny-portal). */
const PORTAL_URL = process.env.PORTAL_URL || "https://portal.scribebunny.com";

const nextConfig: NextConfig = {
  async redirects() {
    return ["/portal", "/portal/:path*", "/concepts/:path*"].map((source) => ({
      source,
      destination: `${PORTAL_URL}${source}`,
      permanent: false,
    }));
  },
  async headers() {
    return PRIVATE_PATHS.flatMap((path) => {
      const base = path.replace(/\/$/, "");
      return [
        { source: base, headers: privateHeaders },
        { source: `${base}/:path*`, headers: privateHeaders },
      ];
    });
  },
};

export default nextConfig;
