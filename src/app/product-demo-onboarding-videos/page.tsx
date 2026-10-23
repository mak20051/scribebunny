import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/service-page-template";
import { fullPortfolio } from "@/lib/portfolio";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the difference between an explainer video and a demo video?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An explainer video focuses on product value and high-level understanding, while a demo video shows how the product works, often through features, workflows, or onboarding steps.",
      },
    },
    {
      "@type": "Question",
      name: "Can demo videos help reduce onboarding friction?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Clear walkthroughs help users understand next steps faster and reduce confusion during activation and adoption.",
      },
    },
    {
      "@type": "Question",
      name: "Can these videos support sales as well as customer success?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Product demo videos can help both prospects and customers understand workflows, features, and outcomes more efficiently.",
      },
    },
  ],
};
export const metadata: Metadata = {
  title: "Product Demo and Onboarding Videos for SaaS Teams | Scribebunny",
  description:
    "Create product demo, onboarding, and feature explainer videos that help users understand your software faster and support activation, training, and sales.",
  alternates: {
    canonical: "https://scribebunny.com/product-demo-onboarding-videos",
  },
};
export default function ProductDemoOnboardingVideosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <ServicePageTemplate
        heroLabel="Built for teams responsible for product understanding"
        title="Product Demo and Onboarding Videos That Make Product Education Easier to Scale"
        description="We create product walkthroughs, feature explainers, onboarding videos, and user education content that help SaaS teams improve understanding, activation, and adoption."
        primaryCta="Book a Strategy Call"
        secondaryCta="View Our Work"
        secondaryHref="/work"
        sections={[
          {
            title:
              "When users understand the product faster, teams move faster too",
            body: "Product education affects onboarding, adoption, support load, and sales efficiency. Clear demo and onboarding videos help users see how the product works without relying only on live explanation.",
          },
          {
            title: "Who this is for",
            bullets: [
              "SaaS product marketing teams",
              "Customer success teams",
              "Sales enablement teams",
              "Startup founders",
              "Marketing teams launching new features",
            ],
          },
          {
            title: "What demo and onboarding videos help solve",
            bullets: [
              "Users do not understand key workflows quickly",
              "Onboarding friction slows activation",
              "Feature launches lack clear explanation",
              "Sales demos are repetitive and time-intensive",
              "Internal teams need scalable product education assets",
            ],
          },
          {
            title: "What’s included in this service",
            bullets: [
              "Workflow and feature understanding",
              "Message hierarchy for product education",
              "Script and structure",
              "Screen flow or visual planning",
              "Demo or explainer production",
              "Revision process",
              "Final delivery for website, onboarding, sales, or support use",
            ],
          },
          {
            title: "Common demo and onboarding video use cases",
            bullets: [
              "Product walkthrough videos",
              "Feature release videos",
              "Onboarding sequences",
              "Customer education content",
              "Sales-support demos",
              "Training assets for users or internal teams",
            ],
          },
          {
            title: "Formats built for product education and enablement",
            bullets: [
              "Main demo or walkthrough video",
              "Feature-specific cutdowns",
              "Onboarding lesson videos",
              "Help-center or support-ready embeds",
              "Sales demo support assets",
            ],
          },
          {
            title: "A practical workflow for demo and onboarding content",
            body: "We align on the product workflow, identify what users need to understand first, shape the explanation, and produce video assets that support education at scale.",
          },
        ]}
        pricingTitle="Starting point"
        pricingBody="Product demo and onboarding video packages typically start from $2,500 depending on complexity, number of workflows, and format requirements."
        faqs={[
          {
            question:
              "What is the difference between an explainer video and a demo video?",
            answer:
              "An explainer video focuses on product value and high-level understanding, while a demo video shows how the product works, often through features, workflows, or onboarding steps.",
          },
          {
            question: "Can demo videos help reduce onboarding friction?",
            answer:
              "Yes. Clear walkthroughs help users understand next steps faster and reduce confusion during activation and adoption.",
          },
          {
            question:
              "Can these videos support sales as well as customer success?",
            answer:
              "Yes. Product demo videos can help both prospects and customers understand workflows, features, and outcomes more efficiently.",
          },
        ]}
        portfolioTitle="Product demo and onboarding examples"
        portfolioDescription="Relevant portfolio samples mapped to Product Demos & Onboarding for this service page."
        portfolioVideos={fullPortfolio
          .filter((video) => video.category === "Product Demos & Onboarding")
          .slice(0, 4)}
        finalTitle="Need product education content your team can use again and again?"
        finalBody="We can help you turn product workflows into clear, reusable demo and onboarding assets."
        finalSecondary="Request a Quote"
        topDoodle="📱"
        sideDoodle="🎓"
      />
    </>
  );
}
