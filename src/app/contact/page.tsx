import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import {
  BulletGrid,
  FinalCta,
  MarketingHero,
  MarketingSection,
  PageDivider,
  SimpleFaq,
} from "@/components/marketing";
import { SiteShell } from "@/components/site-shell";

const callExpectations = [
    "A quick discussion of your product or service",
    "Clarification of the video use case",
    "Fit assessment based on audience, timeline, and scope",
    "Guidance on the best starting package or engagement model",
    "Next-step recommendation for proposal or project scope",
  ],
  fitSignals = [
    "You need to explain a SaaS or technical product more clearly",
    "You want a stronger launch, sales, or onboarding asset",
    "You need recurring video support without building in-house",
    "You are an agency looking for white-label fulfillment",
    "You value clear communication and structured delivery",
  ],
  faqs = [
    {
      question: "Do I need a full brief before reaching out?",
      answer:
        "No. If you have a rough outline of your product, audience, and goal, that is enough to start the conversation.",
    },
    {
      question: "Can agencies inquire about recurring white-label support?",
      answer:
        "Yes. Agencies can use this page to start a conversation about project-based support or ongoing partnership models.",
    },
    {
      question: "What happens after the call?",
      answer:
        "If the project looks like a fit, the next step is usually a clearer scope, proposal, or recommended package based on your needs.",
    },
  ];
export const metadata: Metadata = {
  title:
    "Book a Strategy Call for Explainer or Demo Video Projects | Scribebunny",
  description:
    "Contact Scribebunny to discuss explainer videos, product demos, onboarding content, or white-label video production. Book a strategy call or request a quote.",
  alternates: {
    canonical: "https://scribebunny.com/contact",
  },
};
export default function ContactPage() {
  return (
    <SiteShell>
      <main className="relative overflow-x-hidden bg-[linear-gradient(135deg,#FFF5F5_0%,#FFFFFF_50%,#FFF9F0_100%)] text-slate-800">
        <MarketingHero
          label="A simple starting point for qualified video inquiries"
          title="Request a Quote"
          description="Tell us about your product, audience, and project goals, and we’ll help you map the right video approach. If you just want pricing or scope first, you can use the same form to request a quote."
          primaryCta="Book a Strategy Call"
          secondaryCta="Request a Quote"
          secondaryHref="#contact-form"
        />
        <PageDivider />
        <MarketingSection
          label="Credibility"
          title="A simple starting point for qualified video inquiries"
          description="Whether you need a SaaS explainer, a product walkthrough, onboarding content, or a white-label production partner, this call is designed to help you clarify scope, fit, and next steps."
        >
          <div />
        </MarketingSection>
        <PageDivider />
        <MarketingSection
          label="What to expect"
          title="What to expect from the call"
        >
          <BulletGrid items={callExpectations} />
        </MarketingSection>
        <PageDivider />
        <MarketingSection label="Good fit" title="You may be a strong fit if:">
          <BulletGrid items={fitSignals} />
        </MarketingSection>
        <PageDivider />
        <section
          id="contact-form"
          className="relative z-10 overflow-hidden bg-[#FFE66D] py-20"
        >
          <div className="relative mx-auto max-w-4xl px-6 sm:px-8">
            <div className="mb-10 text-center">
              <span className="mb-4 inline-block rotate-[1deg] rounded-full border-2 border-gray-800 bg-[#FF6B6B] px-4 py-2 text-sm font-bold text-white">
                STRATEGY CALL REQUEST
              </span>
              <h2 className="font-display text-5xl font-bold text-gray-800">
                Request a Quote
              </h2>
              <p className="font-handwritten mt-4 text-xl text-gray-700">
                Tell us about your product, audience, and goals, and we’ll use
                the details to guide the strategy call and next-step
                recommendation.
              </p>
            </div>
            <div className="mx-auto max-w-2xl rounded-3xl border-4 border-gray-800 bg-white p-8 text-left shadow-[12px_12px_0_#2D3748]">
              <ContactForm />
            </div>
          </div>
        </section>
        <PageDivider />
        <MarketingSection label="FAQs" title="Contact and project fit FAQs">
          <SimpleFaq items={faqs} />
        </MarketingSection>
        <FinalCta
          title="Ready to discuss your project?"
          description="Book a strategy call and let’s map out the most useful video approach for your product, team, or client work."
          primary="Book a Strategy Call"
          secondary="Request a Quote"
        />
      </main>
    </SiteShell>
  );
}
