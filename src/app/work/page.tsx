import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import {
  FinalCta,
  MarketingHero,
  MarketingSection,
  PageDivider,
} from "@/components/marketing";
import { SiteShell } from "@/components/site-shell";
import { PortfolioGallery } from "@/components/portfolio-gallery";
import { VideoCard } from "@/components/video-card";
import { fullPortfolio, latestWork } from "@/lib/portfolio";

const caseStudies = [
    {
      id: "mIoX7bjn6x4",
      title: "SaaS Homepage Explainer",
      category: "SaaS Explainers",
      clientType: "B2B SaaS company",
      challenge:
        "The product solved an important workflow problem, but the homepage did not explain the value clearly enough for first-time visitors.",
      created: "A concise explainer video for homepage and launch support.",
      timeline: "Custom per project scope",
      result:
        "Created a clearer product story for prospects and gave the marketing team a reusable launch asset.",
    },
    {
      id: "HRKoX2jBG0E",
      title: "Product Demo and Onboarding Asset",
      category: "Product Demos & Onboarding",
      clientType: "Software product team",
      challenge:
        "Users needed a clearer walkthrough of key workflows to reduce confusion during onboarding.",
      created: "A product demo and onboarding video sequence.",
      timeline: "Custom per project scope",
      result:
        "Improved product understanding and created a scalable education asset for users and internal teams.",
    },
    {
      id: "Mqy8pDDympw",
      title: "Agency White-Label Delivery Partnership",
      category: "White-Label / Agency Work",
      clientType: "Marketing or creative agency",
      challenge:
        "The agency needed dependable video fulfillment without hiring an in-house production team.",
      created:
        "White-label explainer and support video assets delivered behind the scenes.",
      timeline: "Ongoing or recurring support model",
      result:
        "Helped the agency fulfill client demand more consistently while reducing operational strain.",
    },
  ],
  outcomes = [
    "Clearer product story for launch",
    "Faster understanding for prospects",
    "Stronger sales-support assets",
    "Better onboarding clarity",
    "More scalable product education",
    "More dependable fulfillment for agencies",
  ];
export const metadata: Metadata = pageMetadata({
  title: "Explainer Video Work and Case Studies | Scribebunny",
  description:
    "See how Scribebunny creates explainer, demo, onboarding, and agency-partner video work designed to improve clarity, launches, sales support, and product education.",
  path: "/work",
});
export default function WorkPage() {
  return (
    <SiteShell>
      <JsonLd data={breadcrumbSchema("Our Work", "/work")} />
      <main className="relative overflow-x-hidden bg-[linear-gradient(135deg,#FFF5F5_0%,#FFFFFF_50%,#FFF9F0_100%)] text-slate-800">
        <MarketingHero
          label="Our work"
          title="Explainer Video Work and Case Studies for SaaS & Agencies"
          description="A closer look at the videos we create and the business problems they are built to solve."
          primaryCta="Book a Strategy Call"
          secondaryCta="Request a Quote"
          secondaryHref="/contact#contact-form"
        />
        <PageDivider />
        <MarketingSection
          label="Just released"
          title="New from the studio"
          description="The latest stories we've drawn and animated for our clients."
        >
          <div className="grid gap-8 md:grid-cols-2">
            {latestWork.map((video, index) => (
              <VideoCard key={video.id} video={video} priority={index < 2} />
            ))}
          </div>
        </MarketingSection>
        <PageDivider />
        <MarketingSection
          label="Intro"
          title="More than a gallery"
          description="Each project here was built to help a client explain something more clearly, support a launch, strengthen sales communication, or improve onboarding."
        />
        <PageDivider />
        <MarketingSection label="Case studies" title="Featured projects">
          <div className="grid gap-10 lg:grid-cols-3">
            {caseStudies.map((caseStudy) => (
              <div key={caseStudy.title} className="space-y-5">
                <VideoCard
                  video={{
                    id: caseStudy.id,
                    title: caseStudy.title,
                    category: caseStudy.category,
                    summary: caseStudy.created,
                  }}
                />
                <article className="testimonial-card text-left">
                  <div className="space-y-3 text-gray-600">
                    <p>
                      <strong>Client type:</strong> {caseStudy.clientType}
                    </p>
                    <p>
                      <strong>Challenge:</strong> {caseStudy.challenge}
                    </p>
                    <p>
                      <strong>What Scribebunny created:</strong>{" "}
                      {caseStudy.created}
                    </p>
                    <p>
                      <strong>Timeline:</strong> {caseStudy.timeline}
                    </p>
                    <p>
                      <strong>Result:</strong> {caseStudy.result}
                    </p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </MarketingSection>
        <PageDivider />
        <MarketingSection
          label="Portfolio"
          title="Video gallery"
          description="Browse samples by category, from SaaS explainers to white-label agency work."
        >
          <PortfolioGallery videos={fullPortfolio} />
        </MarketingSection>
        <PageDivider />
        <MarketingSection
          label="Outcomes"
          title="What good video work should help improve"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((outcome) => (
              <div key={outcome} className="service-card p-6">
                <CircleCheck
                  className="mb-3 h-8 w-8 text-[#FF3333]"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
                <p className="font-semibold text-gray-700">{outcome}</p>
              </div>
            ))}
          </div>
        </MarketingSection>
        <FinalCta
          title="Want to create a video that supports a real business goal?"
          description="Let's talk about what you need to explain, who it is for, and what the video needs to help your team achieve."
          primary="Book a Strategy Call"
          secondary="Talk to Us About Your Project"
          secondaryHref="/contact#contact-form"
        />
      </main>
    </SiteShell>
  );
}
