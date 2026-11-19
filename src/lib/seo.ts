import type { Metadata } from "next";
import type { Faq } from "@/components/marketing";
import { videoPackages } from "@/lib/packages";
import {
  ADDRESS,
  EMAIL,
  FOUNDING_YEAR,
  PARENT_COMPANY,
  PHONE_DISPLAY,
  PROFILE_URLS,
  SITE_URL,
} from "@/lib/site";

const ORGANIZATION_ID = `${SITE_URL}/#organization`;

// Pages that set their own openGraph drop the root opengraph-image, so link it explicitly.
const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Scribebunny explainer and product demo videos",
};

export function pageUrl(path: string) {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

export function pageMetadata({
  title,
  description,
  path,
  shareDescription = description,
}: {
  title: string;
  description: string;
  path: string;
  shareDescription?: string;
}): Metadata {
  const url = pageUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: shareDescription,
      url,
      siteName: "Scribebunny",
      type: "website",
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: shareDescription,
      images: [SHARE_IMAGE.url],
    },
  };
}

export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Scribebunny",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/scribebunny-logo-uploaded.png`,
    description:
      "Scribebunny is a small animation studio that loves to draw and tell stories, making whiteboard and 2D explainer, demo, onboarding, and white-label videos for SaaS brands, startups, and agencies.",
    email: EMAIL,
    telephone: PHONE_DISPLAY,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.street,
      addressLocality: ADDRESS.city,
      addressRegion: ADDRESS.region,
      postalCode: ADDRESS.postalCode,
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: PHONE_DISPLAY,
      email: EMAIL,
      availableLanguage: "English",
    },
    parentOrganization: { "@type": "Organization", name: PARENT_COMPANY },
    foundingDate: String(FOUNDING_YEAR),
    areaServed: { "@type": "Country", name: "US" },
    sameAs: PROFILE_URLS,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Scribebunny",
    url: SITE_URL,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function videoPackagesSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Explainer and product demo video production",
    serviceType: "Video production",
    provider: { "@id": ORGANIZATION_ID },
    url: SITE_URL,
    areaServed: { "@type": "Country", name: "US" },
    offers: videoPackages.map((videoPackage) => ({
      "@type": "Offer",
      name: `${videoPackage.name} package`,
      description: videoPackage.turnaround,
      price: (videoPackage.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: SITE_URL,
    })),
  };
}

/** Service schema for one landing page, with the package offers pointing at that page. */
export function pageServiceSchema({
  name,
  description,
  path,
  serviceType = "Video production",
}: {
  name: string;
  description: string;
  path: string;
  serviceType?: string;
}) {
  const url = pageUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType,
    provider: { "@id": ORGANIZATION_ID },
    url,
    areaServed: { "@type": "Country", name: "US" },
    offers: videoPackages.map((videoPackage) => ({
      "@type": "Offer",
      name: `${videoPackage.name} package`,
      description: videoPackage.turnaround,
      price: (videoPackage.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url,
    })),
  };
}

/** VideoObject schema for YouTube videos that have a confirmed upload date. */
export function videoObjectsSchema(
  videos: { id: string; title: string; summary: string; uploadDate?: string }[],
) {
  return videos
    .filter((video) => video.uploadDate)
    .map((video) => ({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: video.title,
      description: video.summary,
      thumbnailUrl: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
      uploadDate: video.uploadDate,
      embedUrl: `https://www.youtube.com/embed/${video.id}`,
    }));
}

export function breadcrumbSchema(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name, item: pageUrl(path) },
    ],
  };
}
