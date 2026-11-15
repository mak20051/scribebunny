import { verticals } from "@/lib/verticals";

/** The service cards on the home page and the llms.txt service list, built from the vertical data. */
export const services = verticals.map((vertical) => ({
  icon: vertical.topDoodle,
  title: vertical.name,
  description: vertical.summary,
  href: `/${vertical.slug}`,
}));
