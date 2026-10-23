import type { Metadata } from "next";
import { MonitorPlay, TrendingUp } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import type { Faq } from "@/components/marketing";
import { serviceCostFaq } from "@/lib/faqs";
import { breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";
import { ServicePageTemplate } from "@/components/service-page-template";
import { fullPortfolio } from "@/lib/portfolio";

const faqs: Faq[] = [
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
  {
    question: "How long does a SaaS explainer video take?",
    answer:
      "A single SaaS explainer video is delivered in 24 to 48 hours once we have your brief. For a series of 5 or 10 videos, we plan the delivery schedule with you around your launch.",
  },
  serviceCostFaq("SaaS explainer video"),
];
export const metadata: Metadata = pageMetadata({
  title: "SaaS Explainer Videos for Launches and Sales | Scribebunny",
  description:
    "Scribebunny creates SaaS explainer videos that help teams simplify product messaging, improve understanding, and support launches, sales, and conversion.",
  path: "/saas-explainer-videos",
});
export default function SaasExplainerVideosPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema(
          "SaaS Explainer Videos",
          "/saas-explainer-videos",
        )}
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
        faqs={faqs}
        portfolioTitle="SaaS explainer video examples"
        portfolioDescription="A shortlist of portfolio videos mapped to the SaaS Explainers category for this page."
        portfolioVideos={fullPortfolio
          .filter((video) => video.category === "SaaS Explainers")
          .slice(0, 4)}
        finalTitle="Need a clearer way to explain your SaaS product?"
        finalBody="We can help you shape a sharper product story and turn it into a video asset your team can reuse across channels."
        finalSecondary="Talk to Us About Your Project"
        topDoodle={MonitorPlay}
        sideDoodle={TrendingUp}
      />
    </>
  );
}
