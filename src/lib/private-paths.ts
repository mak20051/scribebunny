/**
 * Pages whose addresses carry private keys or order details. They are kept out
 * of search engines and AI crawlers (robots.txt, X-Robots-Tag in
 * next.config.ts) and out of third-party trackers (the Facebook Pixel).
 */
export const PRIVATE_PATHS = [
  "/portal",
  "/concepts",
  "/order-confirmed",
  "/stop-reminders",
  "/api/",
];

export const isPrivatePath = (pathname: string) =>
  PRIVATE_PATHS.some(
    (path) =>
      pathname === path.replace(/\/$/, "") ||
      pathname.startsWith(path.endsWith("/") ? path : `${path}/`),
  );
