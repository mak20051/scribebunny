import type { NextConfig } from "next";
import { PRIVATE_PATHS } from "./src/lib/private-paths";

/** Private pages: never indexed, cached by search engines, or named in a Referer. */
const privateHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
  { key: "Referrer-Policy", value: "no-referrer" },
];

const nextConfig: NextConfig = {
  /** www.scribebunny.com -> apex: one host, permanent, path and query kept. */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.scribebunny.com" }],
        destination: "https://scribebunny.com/:path*",
        permanent: true,
      },
    ];
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
