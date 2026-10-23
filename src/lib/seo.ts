import type { Metadata } from "next";
import type { Faq } from "@/components/marketing";
import { videoPackages } from "@/lib/packages";
import {
  ADDRESS,
  EMAIL,
  PARENT_COMPANY,
  PHONE_DISPLAY,
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
      "Scribebunny helps SaaS brands, startups, and agencies simplify complex products with explainer, demo, onboarding, and white-label video production.",
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
    url: `${SITE_URL}/#pricing`,
    offers: videoPackages.map((videoPackage) => ({
      "@type": "Offer",
      name: `${videoPackage.name} package`,
      description: videoPackage.turnaround,
      price: (videoPackage.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      url: `${SITE_URL}/#pricing`,
    })),
  };
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
