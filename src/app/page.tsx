import Link from "next/link";
import { HeroVideo } from "@/components/hero-video";
import { PricingSection } from "@/components/pricing-section";
import { QuotePopupButton } from "@/components/quote-popup";
import { SiteShell } from "@/components/site-shell";
import { VideoCard } from "@/components/video-card";
import { JsonLd } from "@/components/json-ld";
import { SimpleFaq, type Faq } from "@/components/marketing";
import { pricingFaqs } from "@/lib/packages";
import { featuredPortfolio } from "@/lib/portfolio";
import { services } from "@/lib/services";
import {
  faqSchema,
  organizationSchema,
  videoPackagesSchema,
  websiteSchema,
} from "@/lib/seo";

const audiences = [
    {
      title: "SaaS Teams",
      description:
        "Homepage explainers, feature videos, onboarding assets, and product demos that help buyers understand your platform faster.",
      emoji: "💻",
    },
    {
      title: "Startups",
      description:
        "Launch-ready videos that sharpen your product story for homepage, fundraising, sales, and early growth.",
      emoji: "🚀",
    },
    {
      title: "Agencies",
      description:
        "White-label production support for agencies that need reliable video delivery without building an in-house team.",
      emoji: "🤝",
    },
  ],
  outcomes = [
    "Explain complex products with more clarity",
    "Improve homepage understanding for first-time visitors",
    "Support launches with stronger storytelling assets",
    "Reduce friction in onboarding and customer education",
    "Give sales and marketing teams reusable video assets",
    "Deliver client work more reliably through white-label support",
  ],
  caseStudies = [
    {
      id: featuredPortfolio[0].id,
      category: "SaaS Explainers",
      title: "B2B Product Explainer",
      summary:
        "Explainer video designed to clarify product value and support first-time understanding.",
    },
    {
      id: featuredPortfolio[1].id,
      category: "SaaS Explainers",
      title: "Platform Explainer Video",
      summary:
        "Product story video built to help visitors understand the offer quickly and clearly.",
    },
    {
      id: featuredPortfolio[2].id,
      category: "Product Demos & Onboarding",
      title: "Product Education Video",
      summary:
        "Education-focused video designed to help viewers understand the product or process more clearly.",
    },
    {
      id: featuredPortfolio[3].id,
      category: "Product Demos & Onboarding",
      title: "Guided Explainer with Subtitles",
      summary:
        "A structured explainer format suitable for onboarding, education, and support-ready delivery.",
    },
    {
      id: featuredPortfolio[4].id,
      category: "White-Label / Agency Work",
      title: "Service Business Explainer",
      summary:
        "A strong example of client delivery work for a service-based business.",
    },
    {
      id: featuredPortfolio[5].id,
      category: "White-Label / Agency Work",
      title: "White-Label Delivery Example",
      summary:
        "A polished explainer suitable for demonstrating agency-ready production support.",
    },
  ],
  processSteps = [
    {
      number: "1",
      title: "Strategy and Brief",
      description:
        "We align on your product, audience, use case, and message before production starts.",
      color: "bg-[#FFE66D]",
    },
    {
      number: "2",
      title: "Script and Structure",
      description:
        "We shape the core narrative so the video supports understanding and action.",
      color: "bg-[#FF6B6B] text-white",
    },
    {
      number: "3",
      title: "Storyboard",
      description:
        "Visual planning turns the script into a clear, review-ready production blueprint.",
      color: "bg-[#4ECDC4] text-white",
    },
    {
      number: "4",
      title: "Production",
      description:
        "Animation, voiceover, motion, and edits move forward through a structured workflow.",
      color: "bg-[#95E1D3]",
    },
    {
      number: "5",
      title: "Delivery",
      description:
        "Final assets are delivered for launch, sales, onboarding, or client-facing use.",
      color: "bg-[#FF3333] text-white",
    },
  ],
  testimonials = [
    {
      quote:
        "We needed a better way to explain the product on our homepage, and Scribebunny helped us simplify the story without slowing down the launch.",
      name: "Product Marketing Lead",
      role: "B2B SaaS Team",
      initial: "P",
      accent: "bg-[#FFE66D]",
    },
    {
      quote:
        "The final video made it easier for prospects to understand what we do, and it gave our team a much stronger asset for sales and marketing.",
      name: "Founder",
      role: "Growth-stage Startup",
      initial: "F",
      accent: "bg-[#FF6B6B] text-white",
    },
    {
      quote:
        "The process was organized, communication was smooth, and the work fit easily into our client delivery workflow.",
      name: "Agency Director",
      role: "White-label Partner",
      initial: "A",
      accent: "bg-[#4ECDC4] text-white",
    },
  ],
  faqs = [
    {
      question: "What types of videos does Scribebunny create?",
      answer:
        "We create SaaS explainer videos, product demo videos, onboarding videos, feature explainers, and white-label agency video assets.",
    },
    {
      question: "Who is Scribebunny best suited for?",
      answer:
        "We are best suited for SaaS teams, startups, and agencies that need clearer product communication and dependable video production.",
    },
    {
      question: "Can you support ongoing video needs?",
      answer:
        "Yes. We can support one-off projects as well as recurring production needs for growing teams and agency partners.",
    },
    ...pricingFaqs,
  ] satisfies Faq[];
function Doodles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="scribble-line"
        style={{
          top: "15%",
          width: "200px",
          rotate: "-5deg",
        }}
      />
      <div
        className="scribble-line"
        style={{
          top: "35%",
          width: "150px",
          rotate: "3deg",
          animationDelay: "-5s",
        }}
      />
      <div
        className="scribble-line"
        style={{
          top: "55%",
          width: "180px",
          rotate: "-2deg",
          animationDelay: "-10s",
        }}
      />
      <div
        className="scribble-line"
        style={{
          top: "75%",
          width: "220px",
          rotate: "4deg",
          animationDelay: "-15s",
        }}
      />
      <div className="doodle doodle-1">✏️</div>
      <div className="doodle doodle-2">🎨</div>
      <div className="doodle doodle-3">✨</div>
      <div className="doodle doodle-4">🐰</div>
      <div className="doodle doodle-5">🎬</div>
      <div className="doodle doodle-6">💡</div>
      <div className="doodle doodle-7">🎯</div>
      <div className="doodle doodle-8">🚀</div>
    </div>
  );
}
function SectionDivider() {
  return <div className="section-divider" />;
}
export default function HomePage() {
  return (
    <SiteShell>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={videoPackagesSchema()} />
      <JsonLd data={faqSchema(faqs)} />
      <main className="relative overflow-x-hidden bg-[linear-gradient(135deg,#FFF5F5_0%,#FFFFFF_50%,#FFF9F0_100%)] text-slate-800">
        <Doodles />
        <section className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden px-6 pt-32 pb-20 sm:px-8 lg:px-12">
          <div className="max-w-6xl text-center">
            <div className="wiggle mb-8 inline-flex rotate-[-2deg] items-center gap-2 rounded-full border-[3px] border-gray-800 bg-[#FFE66D] px-6 py-3 font-bold text-gray-800 shadow-lg">
              <span className="text-2xl">🎉</span>
              <span>Built for SaaS teams, startups, and agency partners</span>
            </div>
            <h1 className="font-display mb-6 text-5xl font-bold leading-tight text-gray-800 md:text-7xl">
              {"Explainer and Product Demo Videos That "}
              <br />
              <span className="relative inline-block">
                Convert
                <svg
                  className="absolute -bottom-4 left-0 w-full"
                  height="20"
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 15 Q 50 0, 100 15 T 200 15"
                    stroke="#FF6B6B"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="font-handwritten mx-auto mb-10 max-w-3xl text-2xl text-gray-600">
              We help SaaS brands, startups, and agencies simplify complex
              products, improve homepage clarity, and create videos that support
              launches, sales, and onboarding.
            </p>
            <div className="mb-6 flex flex-wrap justify-center gap-4">
              <a
                href="https://calendly.com/scribebunny-info/30min"
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-lg"
              >
                Book a Strategy Call
              </a>
              <a href="#work" className="btn-secondary text-lg">
                View Our Work
              </a>
              <QuotePopupButton />
            </div>
            <p className="mb-12 font-bold text-gray-600">
              Free consultation • No commitment • Response within 24 hours
            </p>
            <div className="mb-16 flex flex-wrap justify-center gap-8">
              <div className="hand-drawn-box min-w-[180px] px-6 py-4">
                <div className="text-sm font-bold text-gray-600">
                  Built for SaaS teams, startups, and agency partners
                </div>
              </div>
              <div className="hand-drawn-box min-w-[180px] px-6 py-4">
                <div className="text-sm font-bold text-gray-600">
                  Explainers, demos, onboarding, and white-label production
                </div>
              </div>
              <div className="hand-drawn-box min-w-[180px] px-6 py-4">
                <div className="text-sm font-bold text-gray-600">
                  Structured timelines for starter, standard, and custom
                  projects
                </div>
              </div>
              <div className="hand-drawn-box min-w-[180px] px-6 py-4">
                <div className="text-sm font-bold text-gray-600">
                  Response within 24 hours
                </div>
              </div>
            </div>
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute -top-8 right-0 rotate-6 rounded-2xl border-[3px] border-gray-800 bg-[#FFE66D] p-4 shadow-[6px_6px_0_#2D3748]">
                <div className="text-2xl">⭐⭐⭐⭐⭐</div>
              </div>
              <HeroVideo />
            </div>
          </div>
        </section>
        <SectionDivider />
        <section className="relative z-10 py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="mb-16 text-center">
              <span className="mb-4 inline-block rotate-[-2deg] rounded-full border-2 border-gray-800 bg-[#FFE66D] px-4 py-2 text-sm font-bold">
                WHO WE HELP
              </span>
              <h2 className="font-display text-5xl font-bold text-gray-800">
                Built for teams that need clarity, speed, and dependable
                delivery
              </h2>
              <p className="font-handwritten mx-auto mt-4 max-w-3xl text-lg text-gray-600">
                Scribebunny works with teams that need video assets to explain
                products clearly, support launches, improve onboarding, and
                deliver stronger communication across marketing, sales, and
                client work.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {audiences.map((audience) => (
                <article key={audience.title} className="service-card">
                  <div className="mb-4 text-5xl">{audience.emoji}</div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-800">
                    {audience.title}
                  </h3>
                  <p className="text-gray-600">{audience.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <SectionDivider />
        <section id="services" className="relative z-10 py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="mb-16 text-center">
              <span className="mb-4 inline-block rotate-[-2deg] rounded-full border-2 border-gray-800 bg-[#FFE66D] px-4 py-2 text-sm font-bold">
                WHAT WE DO
              </span>
              <h2 className="font-display text-5xl font-bold text-gray-800">
                {"Our Core "}
                <span className="text-[#FF3333]">Services</span>
              </h2>
              <p className="font-handwritten mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                Video services designed around business use cases, product
                clarity, and dependable delivery.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Link
                  key={service.title}
                  href={service.href}
                  className="service-card group cursor-pointer block"
                >
                  <div className="mb-4 text-5xl transition-transform group-hover:scale-110">
                    {service.emoji}
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-800">
                    {service.title}
                  </h3>
                  <p className="mb-4 text-gray-600">{service.description}</p>
                  <div className="flex items-center gap-2 font-bold text-[#FF3333]">
                    <span>Learn More</span>
                    <span className="text-xl">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <SectionDivider />
        <section className="relative z-10 py-20 bg-[#FFF5F5]">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12 text-center">
            <span className="mb-4 inline-block rotate-[1deg] rounded-full border-2 border-gray-800 bg-[#FF6B6B] px-4 py-2 text-sm font-bold text-white">
              OUTCOMES
            </span>
            <h2 className="font-display text-5xl font-bold text-gray-800">
              What Our Videos Help You Do
            </h2>
            <p className="font-handwritten mx-auto mt-4 max-w-3xl text-lg text-gray-600">
              The goal is not just to create a polished video. It is to help
              your audience understand faster, support the right business
              outcome, and give your team a more useful asset.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-left">
              {outcomes.map((outcome) => (
                <div key={outcome} className="service-card p-6">
                  <div className="mb-3 text-2xl text-[#FF3333]">✓</div>
                  <p className="font-semibold text-gray-700">{outcome}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <SectionDivider />
        <section id="work" className="relative z-10 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-block rotate-[2deg] rounded-full border-2 border-gray-800 bg-[#FF6B6B] px-4 py-2 text-sm font-bold text-white">
                OUR WORK
              </span>
              <h2 className="font-display text-5xl font-bold text-gray-800">
                {"Featured "}
                <span className="text-[#FF3333]">Projects</span>
              </h2>
              <p className="font-handwritten mx-auto mt-4 max-w-3xl text-lg text-gray-600">
                A closer look at the types of videos we create to support
                product clarity, launches, onboarding, and conversion.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {caseStudies.map((caseStudy, index) => (
                <VideoCard
                  key={caseStudy.id}
                  video={caseStudy}
                  priority={index < 2}
                />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/work" className="btn-secondary inline-flex">
                View Our Work
              </Link>
            </div>
          </div>
        </section>
        <SectionDivider />
        <section id="process" className="relative z-10 py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
            <div className="mb-16 text-center">
              <span className="mb-4 inline-block rotate-[-1deg] rounded-full border-2 border-gray-800 bg-green-400 px-4 py-2 text-sm font-bold">
                HOW WE WORK
              </span>
              <h2 className="font-display text-5xl font-bold text-gray-800">
                {"Our Creative "}
                <span className="text-[#FF3333]">Process</span>
              </h2>
              <p className="font-handwritten mx-auto mt-4 max-w-3xl text-lg text-gray-600">
                We start with product, audience, and use-case clarity — then
                move through scripting, storyboarding, production, and delivery
                with a workflow designed to keep teams aligned and reduce
                production drag.
              </p>
            </div>
            <div className="relative grid gap-6 md:grid-cols-5">
              <div className="absolute top-16 left-0 right-0 -z-10 hidden border-t-4 border-dashed border-gray-300 md:block" />
              {processSteps.map((step) => (
                <div key={step.number} className="group text-center">
                  <div
                    className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-gray-800 text-3xl font-bold shadow-[6px_6px_0_#2D3748] transition-all group-hover:-translate-y-2 group-hover:shadow-[8px_8px_0_#FF3333] ${step.color}`}
                  >
                    {step.number}
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 rounded-2xl border-4 border-gray-800 bg-white px-6 py-4 shadow-[8px_8px_0_#FFE66D]">
                <span className="text-3xl">⏱️</span>
                <div className="text-left">
                  <div className="font-bold text-gray-800">
                    Clear strategy before production • Defined review flow •
                    Final assets built for launch, sales, and onboarding
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <SectionDivider />
        <PricingSection />
        <SectionDivider />
        <section className="relative z-10 py-20">
          <div className="mx-auto max-w-4xl px-6 text-center sm:px-8 lg:px-12">
            <span className="mb-4 inline-block rotate-[1deg] rounded-full border-2 border-gray-800 bg-[#4ECDC4] px-4 py-2 text-sm font-bold">
              TIMELINE
            </span>
            <h2 className="font-display text-5xl font-bold text-gray-800">
              Structured timelines based on scope
            </h2>
            <p className="font-handwritten mt-6 text-xl text-gray-600">
              Starter, standard, and custom delivery paths are scoped separately
              so expectations stay clear from the beginning.
            </p>
            <p className="mt-4 text-gray-600">
              Rush delivery can be planned for selected formats when timelines
              and feedback cycles are aligned.
            </p>
          </div>
        </section>
        <section className="relative z-10 bg-[#FFF5F5] py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="mb-16 text-center">
              <span className="mb-4 inline-block rotate-[1deg] rounded-full border-2 border-gray-800 bg-[#FF6B6B] px-4 py-2 text-sm font-bold text-white">
                TESTIMONIALS
              </span>
              <h2 className="font-display text-5xl font-bold text-gray-800">
                {"Happy "}
                <span className="text-[#FF3333]">Clients</span>
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article key={testimonial.name} className="testimonial-card">
                  <div className="mb-4 flex gap-1">
                    {Array.from({
                      length: 5,
                    }).map((item, index) => (
                      <span key={index} className="star">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="font-handwritten mb-6 text-lg text-gray-700">
                    “{testimonial.quote}”
                  </p>
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-gray-800 font-bold text-xl ${testimonial.accent}`}
                    >
                      {testimonial.initial}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <SectionDivider />
        <section id="faq" className="relative z-10 py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="mb-16 text-center">
              <span className="mb-4 inline-block rotate-[-1deg] rounded-full border-2 border-gray-800 bg-[#4ECDC4] px-4 py-2 text-sm font-bold">
                FAQS
              </span>
              <h2 className="font-display text-5xl font-bold text-gray-800">
                {"Frequently Asked "}
                <span className="text-[#FF3333]">Questions</span>
              </h2>
            </div>
            <SimpleFaq items={faqs} />
          </div>
        </section>
        <SectionDivider />
        <section
          id="contact"
          className="relative z-10 overflow-hidden bg-[#FFE66D] py-20"
        >
          <div className="absolute top-10 left-10 text-6xl opacity-20">✏️</div>
          <div className="absolute right-10 bottom-10 text-6xl opacity-20">
            🎨
          </div>
          <div className="absolute top-1/2 right-20 text-5xl opacity-20">
            ✨
          </div>
          <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-8">
            <h2 className="font-display text-5xl font-bold text-gray-800 md:text-6xl">
              Need a clearer way to explain your product?
            </h2>
            <p className="font-handwritten mx-auto mt-6 max-w-3xl text-xl text-gray-700">
              Let’s talk about your product, audience, and business goal — and
              map out the right explainer, demo, onboarding, or white-label
              video approach.
            </p>
            <div className="mb-12 mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="https://calendly.com/scribebunny-info/30min"
                target="_blank"
                rel="noreferrer"
                className="btn-primary border-gray-800 bg-gray-800 shadow-gray-600"
              >
                Book a Strategy Call
              </a>
              <QuotePopupButton className="btn-secondary bg-white" />
            </div>
            <p className="font-bold text-gray-700">
              Free consultation • No commitment • Response within 24 hours
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
