import {
  EVERY_VIDEO_INCLUDES,
  formatUsd,
  packageSummary,
  perVideoCents,
  savingsCents,
  videoPackages,
} from "@/lib/packages";
import { services } from "@/lib/services";
import {
  ADDRESS,
  CALENDLY_URL,
  EMAIL,
  PARENT_COMPANY,
  PHONE_DISPLAY,
  SITE_URL,
} from "@/lib/site";

export const dynamic = "force-static";

function packageLine(videoPackage: (typeof videoPackages)[number]) {
  const savings = savingsCents(videoPackage);
  const pricing =
    savings > 0
      ? ` (${formatUsd(perVideoCents(videoPackage))} per video, save ${formatUsd(savings)})`
      : "";
  return `- ${videoPackage.name}: ${formatUsd(videoPackage.priceCents)}${pricing}. ${packageSummary(videoPackage)}`;
}

export function GET() {
  const body = `# Scribebunny

> Scribebunny is a small animation studio that loves to draw and tell stories. We create whiteboard and 2D explainer, product demo, onboarding, and white-label videos for SaaS brands, startups, and agencies. Scribebunny is a brand of ${PARENT_COMPANY}.

## Video packages

${videoPackages.map(packageLine).join("\n")}
- Bulk (more than 10 videos): custom pricing, contact the team at ${SITE_URL}/contact

Every video includes: ${EVERY_VIDEO_INCLUDES.join("; ")}.

Buy online through secure Stripe checkout at ${SITE_URL}/#pricing. Invoices are issued by ${PARENT_COMPANY}.

Free offer: 3 video concepts researched from your own website and reviewed by our storytellers, delivered by email within 24 hours: ${SITE_URL}/free-concepts

## Services

${services.map((service) => `- [${service.title}](${SITE_URL}${service.href}): ${service.description}`).join("\n")}

## Pages

- [Home](${SITE_URL}): overview, pricing, process, and FAQs
- [Our Work](${SITE_URL}/work): portfolio videos and case studies
- [Contact](${SITE_URL}/contact): request a quote or book a strategy call

## Contact

- Email: ${EMAIL}
- Hotline: ${PHONE_DISPLAY}
- Address: ${ADDRESS.street}, ${ADDRESS.city}, ${ADDRESS.region} ${ADDRESS.postalCode}, ${ADDRESS.country}
- Book a strategy call: ${CALENDLY_URL}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
