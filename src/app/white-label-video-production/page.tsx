import type { Metadata } from "next";
import { Handshake, Puzzle } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import type { Faq } from "@/components/marketing";
import { serviceCostFaq } from "@/lib/faqs";
import { breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";
import { AgencyInquiryForm } from "@/components/agency-inquiry-form";
import { ServicePageTemplate } from "@/components/service-page-template";
import { fullPortfolio } from "@/lib/portfolio";

const faqs: Faq[] = [
  {
    question: "What does white-label video production mean?",
    answer:
      "White-label video production means Scribebunny creates video assets behind the scenes so your agency can offer and deliver the work under your own brand.",
  },
  {
    question: "Can you support recurring client work?",
    answer:
      "Yes. We can support recurring production needs, project-based work, or ongoing monthly partnership models depending on volume and fit.",
  },
  {
    question: "Why not just use freelancers?",
    answer:
      "Freelancers can help in some cases, but agencies often need more consistency, clearer workflow, and a more dependable delivery model than ad hoc freelance support provides.",
  },
  {
    question: "How does pricing work for agencies?",
    answer:
      "Agencies can buy our 1, 5, or 10 video packages online, or talk to us about volume pricing for more than 10 videos. Every order gets its own private project portal, so each of your clients' videos stays organized.",
  },
  serviceCostFaq("white-label explainer video"),
];
export const metadata: Metadata = pageMetadata({
  title: "White-Label Explainer Video Production | Scribebunny",
  description:
    "Partner with Scribebunny for white-label explainer, demo, and animation production. Reliable video fulfillment for agencies without adding in-house overhead.",
  path: "/white-label-video-production",
});
export default function WhiteLabelVideoProductionPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema(
          "White-Label Video Production",
          "/white-label-video-production",
        )}
      />
      <ServicePageTemplate
        heroLabel="Built for agencies that need a trusted production partner"
        title="White-Label Video Production for Agencies That Need Reliable Delivery"
        description="Scribebunny helps agencies fulfill explainer, demo, onboarding, and video production needs behind the scenes, with dependable communication, clear workflow, and scalable delivery."
        primaryCta="Book a Strategy Call"
        secondaryCta="Agency Partner Inquiry"
        secondaryHref="#agency-form"
        sections={[
          {
            title: "Who this is for",
            body: "This service is designed for agency founders, creative directors, account leads, delivery teams, and operations leads who need to offer video services without building a full internal production function.",
            bullets: [
              "Agency founders",
              "Creative directors",
              "Account directors",
              "Delivery leads",
              "Operations leads",
            ],
          },
          {
            title: "Why agencies look for white-label video partners",
            bullets: [
              "Clients ask for video work the team cannot fulfill in-house",
              "Freelancers are inconsistent or difficult to manage",
              "Delivery quality varies across projects",
              "Video production adds operational strain",
              "Internal hiring is too slow or too expensive for current demand",
            ],
          },
          {
            title:
              "A production model designed to support your client delivery",
            body: "We work behind the scenes to help your agency deliver high-quality video work under your own brand. The process is structured to stay smooth, responsive, and practical for agency environments.",
            bullets: [
              "Brief intake aligned to your client needs",
              "Clear scope and production planning",
              "Structured communication through the project",
              "Reliable review and revision workflow",
              "Final assets delivered in a partner-friendly format",
            ],
          },
          {
            title: "White-label support across key video needs",
            bullets: [
              "Explainer videos",
              "Product demo videos",
              "Onboarding videos",
              "Feature launch videos",
              "Campaign support videos",
              "Recurring client production support",
            ],
          },
          {
            title:
              "Why agencies choose a white-label partner instead of patching delivery together",
            bullets: [
              "More consistent fulfillment",
              "Predictable timelines",
              "Quality delivery without adding headcount",
              "Easier operational planning",
              "A partner model built for repeat work",
              "Communication that supports account and delivery teams",
            ],
          },
          {
            title: "Structured to fit agency operations",
            body: "White-label partnerships need more than production skill. They need clear communication, dependable timing, and a workflow that reduces friction for account and delivery teams. Scribebunny is built to support that.",
          },
          {
            title: "A better way to fulfill video work at scale",
            body: "Instead of scrambling between freelancers or overloading your internal team, you get a reliable production partner that helps you protect quality, delivery confidence, and client experience.",
          },
        ]}
        pricingTitle="Engagement model"
        pricingBody="White-label agency partnerships are typically scoped as custom engagements or monthly support plans, with starting points from $5,000 depending on volume, delivery model, and service mix."
        faqs={faqs}
        portfolioTitle="White-label and agency examples"
        portfolioDescription="Relevant portfolio samples mapped to White-Label / Agency Work for this service page."
        portfolioVideos={fullPortfolio
          .filter((video) => video.category === "White-Label / Agency Work")
          .slice(0, 6)}
        formSection={
          <section
            id="agency-form"
            className="rounded-[1.75rem] border-4 border-gray-800 bg-white px-6 py-7 shadow-[10px_10px_0_rgba(255,230,109,0.9)]"
          >
            <p className="mb-2 text-base font-bold uppercase tracking-[0.18em] text-[#FF3333]">
              Agency partner inquiry
            </p>
            <h2 className="font-display text-4xl font-bold text-gray-800">
              Tell us about your agency and support needs
            </h2>
            <p className="mt-3 text-lg leading-8 text-gray-600">
              Use this form if you are an agency exploring project-based or
              recurring white-label video support.
            </p>
            <div className="mt-6">
              <AgencyInquiryForm />
            </div>
          </section>
        }
        finalTitle="Need a reliable white-label video partner for your agency?"
        finalBody="Let’s talk about your workflow, client needs, and what a smoother production partnership could look like."
        finalSecondary="Agency Partner Inquiry"
        topDoodle={Handshake}
        sideDoodle={Puzzle}
      />
    </>
  );
}
