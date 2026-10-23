import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/service-page-template";
import { fullPortfolio } from "@/lib/portfolio";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a SaaS explainer video?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A SaaS explainer video is a short video designed to help potential buyers understand a software product, what problem it solves, and why it matters.",
      },
    },
    {
      "@type": "Question",
      name: "Where can we use a SaaS explainer video?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can use it on your homepage, landing pages, launch campaigns, sales decks, email flows, and outbound communication.",
      },
    },
    {
      "@type": "Question",
      name: "Can one video support multiple teams?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. A strong product narrative can support marketing, sales, partnerships, onboarding, and launch communication.",
      },
    },
  ],
};
export const metadata: Metadata = {
  title:
    "SaaS Explainer Videos for Product Marketing and Launches | Scribebunny",
  description:
    "Scribebunny creates SaaS explainer videos that help teams simplify product messaging, improve understanding, and support launches, sales, and conversion.",
  alternates: {
    canonical: "https://scribebunny.com/saas-explainer-videos",
  },
};
export default function SaasExplainerVideosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <ServicePageTemplate
        heroLabel="Built for SaaS teams that need a clearer product story"
        title="SaaS Explainer Videos That Make Complex Products Easier to Understand"
        description="We help SaaS teams turn technical products, features, and workflows into clear, conversion-focused explainer videos for homepages, launches, and sales support."
        primaryCta="Book a Strategy Call"
        secondaryCta="Request a Quote"
        sections={[
          {
            title: "Who this is for",
            body: "This service is designed for founders, product marketers, heads of marketing, and growth teams that need buyers to understand product value faster.",
            bullets: [
              "Founders and co-founders",
              "Product marketing managers",
              "Heads of marketing",
              "Growth leads",
              "SaaS sales teams launching new messaging",
            ],
          },
          {
            title: "When your product is hard to explain, growth gets slower",
            body: "Many SaaS teams struggle with product messaging because the product does too much, the category is unfamiliar, or the value is not obvious in the first few seconds.",
            bullets: [
              "Homepage copy alone is not enough",
              "Buyers do not understand the product quickly",
              "Sales teams repeat the same explanation manually",
              "Launch narratives feel fragmented",
              "Product value gets lost in technical language",
            ],
          },
          {
            title: "What’s included in a SaaS explainer engagement",
            bullets: [
              "Messaging and positioning alignment",
              "Video concept development",
              "Script writing and narrative structure",
              "Storyboarding",
              "Visual direction",
              "Voiceover and animation production",
              "Review and revision rounds",
              "Final delivery in agreed formats",
            ],
          },
          {
            title: "Common use cases for SaaS explainer videos",
            bullets: [
              "Homepage explainer video",
              "Product overview video",
              "Launch announcement video",
              "Sales enablement asset",
              "Paid campaign landing-page support",
              "Investor or partner overview video",
            ],
          },
          {
            title: "Flexible deliverables built from one core product story",
            body: "A strong explainer video can support more than one channel. We help teams create core messaging assets that can be reused across homepage sections, launch campaigns, sales decks, demos, and outbound communication.",
            bullets: [
              "Main explainer video",
              "Cutdowns for ads or social use",
              "Website embed version",
              "Sales-support version",
              "Launch-support messaging asset",
            ],
          },
          {
            title: "How we build explainer videos",
            body: "We begin by understanding your product, audience, and message priority. From there, we shape the script, structure the story, move into production, and deliver an asset built to support understanding and action.",
          },
        ]}
        pricingTitle="Starting point"
        pricingBody="SaaS explainer video packages typically start from $3,500 depending on scope, length, style, and production requirements."
        faqs={[
          {
            question: "What is a SaaS explainer video?",
            answer:
              "A SaaS explainer video is a short video designed to help potential buyers understand a software product, what problem it solves, and why it matters.",
          },
          {
            question: "Where can we use a SaaS explainer video?",
            answer:
              "You can use it on your homepage, landing pages, launch campaigns, sales decks, email flows, and outbound communication.",
          },
          {
            question: "Can one video support multiple teams?",
            answer:
              "Yes. A strong product narrative can support marketing, sales, partnerships, onboarding, and launch communication.",
          },
        ]}
        portfolioTitle="SaaS explainer video examples"
        portfolioDescription="A shortlist of portfolio videos mapped to the SaaS Explainers category for this page."
        portfolioVideos={fullPortfolio
          .filter((video) => video.category === "SaaS Explainers")
          .slice(0, 4)}
        finalTitle="Need a clearer way to explain your SaaS product?"
        finalBody="We can help you shape a sharper product story and turn it into a video asset your team can reuse across channels."
        finalSecondary="Talk to Us About Your Project"
        topDoodle="💻"
        sideDoodle="📈"
      />
    </>
  );
}
