import Link from "next/link";
import {
  AppWindow,
  ArrowRight,
  BookOpen,
  CircleCheck,
  Clapperboard,
  Clock,
  Heart,
  Lightbulb,
  Palette,
  Pencil,
  PenTool,
  Play,
  Rabbit,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { CheckoutButton } from "@/components/checkout-button";
import { IconTile } from "@/components/icon-tile";
import { HeroVideo } from "@/components/hero-video";
import { PricingSection } from "@/components/pricing-section";
import { QuotePopupButton } from "@/components/quote-popup";
import { SiteShell } from "@/components/site-shell";
import { VideoCard } from "@/components/video-card";
import { JsonLd } from "@/components/json-ld";
import { SimpleFaq, type Faq } from "@/components/marketing";
import { formatUsd, pricingFaqs, videoPackages } from "@/lib/packages";
import { featuredPortfolio, latestWork } from "@/lib/portfolio";
import { services } from "@/lib/services";
import {
  faqSchema,
  organizationSchema,
  videoPackagesSchema,
  websiteSchema,
} from "@/lib/seo";
import { CALENDLY_URL } from "@/lib/site";

const homeWork = [...latestWork, ...featuredPortfolio.slice(0, 2)];

const startingPrice = formatUsd(
  Math.min(...videoPackages.map((videoPackage) => videoPackage.priceCents)),
);

const studioValues = [
    {
      title: "We love to draw",
      description:
        "Every frame starts as a sketch, from hand-drawn whiteboard stories to colorful 2D illustration.",
      icon: PenTool,
      tone: "yellow" as const,
    },
    {
      title: "We tell stories",
      description:
        "We find the story inside your product, so viewers remember it instead of just watching it.",
      icon: BookOpen,
      tone: "coral" as const,
    },
    {
      title: "Small studio, close collaboration",
      description:
        "You work closely with the small team that writes, draws, and animates your video.",
      icon: Heart,
      tone: "teal" as const,
    },
  ],
  audiences = [
    {
      title: "SaaS Teams",
      description:
        "Homepage explainers, feature videos, onboarding assets, and product demos that help buyers understand your platform faster.",
      icon: AppWindow,
      tone: "yellow" as const,
    },
    {
      title: "Startups",
      description:
        "Launch-ready videos that sharpen your product story for homepage, fundraising, sales, and early growth.",
      icon: Rocket,
      tone: "coral" as const,
    },
    {
      title: "Agencies",
      description:
        "White-label production support for agencies that need reliable video delivery without building an in-house team.",
      icon: Users,
      tone: "teal" as const,
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
    <div
      className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden md:block"
      aria-hidden="true"
    >
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
      <div className="doodle doodle-1">
        <Pencil className="h-14 w-14" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="doodle doodle-2">
        <Palette className="h-14 w-14" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="doodle doodle-3">
        <Sparkles className="h-14 w-14" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="doodle doodle-4">
        <Rabbit className="h-14 w-14" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="doodle doodle-5">
        <Clapperboard
          className="h-14 w-14"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
      <div className="doodle doodle-6">
        <Lightbulb
          className="h-14 w-14"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
      <div className="doodle doodle-7">
        <Target className="h-14 w-14" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="doodle doodle-8">
        <Rocket className="h-14 w-14" strokeWidth={1.75} aria-hidden="true" />
      </div>
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
        <section className="relative z-10 overflow-hidden px-6 pt-32 pb-20 sm:px-8 lg:px-12 lg:pt-36">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="mb-7 inline-flex rotate-[-2deg] items-center gap-2 rounded-full border-[3px] border-gray-800 bg-[#FFE66D] px-5 py-2 text-base font-bold text-gray-800 shadow-[4px_4px_0_#2D3748]">
                <Zap className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
                <span>
                  1 video for {startingPrice}, delivered in 24 to 48 hours
                </span>
              </div>
              <h1 className="font-display text-[2.75rem] leading-[1.05] font-extrabold text-gray-800 sm:text-6xl lg:text-[3.5rem] xl:text-[4rem]">
                {"Explainer & Product Demo Videos That "}
                <span className="relative inline-block text-[#FF3333]">
                  Convert
                  <svg
                    className="absolute -bottom-3 left-0 w-full"
                    height="16"
                    viewBox="0 0 200 20"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 15 Q 50 0, 100 15 T 200 15"
                      stroke="#2D3748"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-gray-700 md:text-2xl lg:mx-0">
                We&apos;re a small studio that loves to draw and tell stories. We
                turn complex products into clear whiteboard and 2D explainer
                videos for SaaS brands, startups, and agencies.
              </p>
              <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:justify-center lg:justify-start">
                <CheckoutButton
                  packageId="single"
                  label={`Order a Video for ${startingPrice}`}
                  className="btn-primary text-lg"
                />
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-lg"
                >
                  Book a Free Strategy Call
                </a>
              </div>
              <a
                href="#pricing"
                className="mt-6 inline-flex items-center gap-2 text-lg font-bold text-[#FF3333] hover:underline"
              >
                See 5 and 10 video packages
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
              <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-base font-semibold text-gray-700 lg:justify-start">
                <li className="flex items-center gap-2">
                  <ShieldCheck
                    className="h-5 w-5 text-[#FF3333]"
                    aria-hidden="true"
                  />
                  Secure Stripe checkout
                </li>
                <li className="flex items-center gap-2">
                  <Clock
                    className="h-5 w-5 text-[#FF3333]"
                    aria-hidden="true"
                  />
                  Response within 24 hours
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheck
                    className="h-5 w-5 text-[#FF3333]"
                    aria-hidden="true"
                  />
                  Free consultation, no commitment
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute -top-5 -right-2 z-10 flex rotate-6 items-center gap-2 rounded-2xl border-[3px] border-gray-800 bg-[#FF6B6B] px-4 py-2 font-bold text-white shadow-[4px_4px_0_#2D3748]">
                <Play className="h-5 w-5 fill-white" aria-hidden="true" />
                Watch how we work
              </div>
              <HeroVideo />
              <p className="font-handwritten mt-6 text-center text-2xl text-gray-700">
                Every video starts with a story and a sketch.
              </p>
            </div>
          </div>
        </section>
        <SectionDivider />
        <section id="studio" className="relative z-10 py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
            <div className="mb-14 text-center">
              <span className="mb-4 inline-block rotate-[-2deg] rounded-full border-2 border-gray-800 bg-[#4ECDC4] px-4 py-2 text-base font-bold">
                MEET THE STUDIO
              </span>
              <h2 className="font-display text-5xl font-bold text-gray-800">
                {"A small studio that loves to "}
                <span className="text-[#FF3333]">draw</span>
                {" and tell "}
                <span className="text-[#FF3333]">stories</span>
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-700 md:text-xl">
                Scribebunny is a small animation studio of illustrators and
                storytellers. We find the story in your product, sketch it frame
                by frame, and bring it to life.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {studioValues.map((value) => (
                <article key={value.title} className="service-card">
                  <IconTile icon={value.icon} tone={value.tone} />
                  <h3 className="mb-3 text-2xl font-bold text-gray-800">
                    {value.title}
                  </h3>
                  <p className="text-gray-700">{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <SectionDivider />
        <section className="relative z-10 py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="mb-16 text-center">
              <span className="mb-4 inline-block rotate-[-2deg] rounded-full border-2 border-gray-800 bg-[#FFE66D] px-4 py-2 text-base font-bold">
                WHO WE HELP
              </span>
              <h2 className="font-display text-5xl font-bold text-gray-800">
                Built for teams that need clarity, speed, and dependable
                delivery
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-700 md:text-xl">
                Scribebunny works with teams that need video assets to explain
                products clearly, support launches, improve onboarding, and
                deliver stronger communication across marketing, sales, and
                client work.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {audiences.map((audience) => (
                <article key={audience.title} className="service-card">
                  <IconTile icon={audience.icon} tone={audience.tone} />
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
              <span className="mb-4 inline-block rotate-[-2deg] rounded-full border-2 border-gray-800 bg-[#FFE66D] px-4 py-2 text-base font-bold">
                WHAT WE DO
              </span>
              <h2 className="font-display text-5xl font-bold text-gray-800">
                {"Our Core "}
                <span className="text-[#FF3333]">Services</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-700 md:text-xl">
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
                  <IconTile
                    icon={service.icon}
                    tone="yellow"
                    className="mb-5 transition-transform group-hover:-rotate-6"
                  />
                  <h3 className="mb-3 text-2xl font-bold text-gray-800">
                    {service.title}
                  </h3>
                  <p className="mb-4 text-gray-600">{service.description}</p>
                  <div className="flex items-center gap-2 font-bold text-[#FF3333]">
                    <span>Learn More</span>
                    <ArrowRight
                      className="h-5 w-5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <SectionDivider />
        <section className="relative z-10 py-20 bg-[#FFF5F5]">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12 text-center">
            <span className="mb-4 inline-block rotate-[1deg] rounded-full border-2 border-gray-800 bg-[#FF6B6B] px-4 py-2 text-base font-bold text-white">
              OUTCOMES
            </span>
            <h2 className="font-display text-5xl font-bold text-gray-800">
              What Our Videos Help You Do
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-700 md:text-xl">
              The goal is not just to create a polished video. It is to help
              your audience understand faster, support the right business
              outcome, and give your team a more useful asset.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-left">
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
          </div>
        </section>
        <SectionDivider />
        <section id="work" className="relative z-10 bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-block rotate-[2deg] rounded-full border-2 border-gray-800 bg-[#FF6B6B] px-4 py-2 text-base font-bold text-white">
                OUR WORK
              </span>
              <h2 className="font-display text-5xl font-bold text-gray-800">
                {"Featured "}
                <span className="text-[#FF3333]">Projects</span>
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-700 md:text-xl">
                Our newest videos, fresh off the drawing board, plus a few
                favorites from the archive.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {homeWork.map((video, index) => (
                <VideoCard key={video.id} video={video} priority={index < 2} />
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
              <span className="mb-4 inline-block rotate-[-1deg] rounded-full border-2 border-gray-800 bg-green-400 px-4 py-2 text-base font-bold">
                HOW WE WORK
              </span>
              <h2 className="font-display text-5xl font-bold text-gray-800">
                {"Our Creative "}
                <span className="text-[#FF3333]">Process</span>
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-700 md:text-xl">
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
                  <p className="text-base text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 rounded-2xl border-4 border-gray-800 bg-white px-6 py-4 shadow-[8px_8px_0_#FFE66D]">
                <Clock
                  className="h-8 w-8 shrink-0 text-[#FF3333]"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
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
            <span className="mb-4 inline-block rotate-[1deg] rounded-full border-2 border-gray-800 bg-[#4ECDC4] px-4 py-2 text-base font-bold">
              TIMELINE
            </span>
            <h2 className="font-display text-5xl font-bold text-gray-800">
              Structured timelines based on scope
            </h2>
            <p className="mt-6 text-xl leading-relaxed text-gray-700">
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
              <span className="mb-4 inline-block rotate-[1deg] rounded-full border-2 border-gray-800 bg-[#FF6B6B] px-4 py-2 text-base font-bold text-white">
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
                      <Star
                        key={index}
                        className="h-6 w-6 fill-[#FFE66D] text-gray-800"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="font-handwritten mb-6 text-2xl leading-snug text-gray-800">
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
                      <div className="text-base text-gray-600">
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
              <span className="mb-4 inline-block rotate-[-1deg] rounded-full border-2 border-gray-800 bg-[#4ECDC4] px-4 py-2 text-base font-bold">
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
          <Pencil
            className="absolute top-10 left-10 h-16 w-16 opacity-20"
            aria-hidden="true"
          />
          <Palette
            className="absolute right-10 bottom-10 h-16 w-16 opacity-20"
            aria-hidden="true"
          />
          <Sparkles
            className="absolute top-1/2 right-20 h-14 w-14 opacity-20"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-8">
            <h2 className="font-display text-5xl font-bold text-gray-800 md:text-6xl">
              Need a clearer way to explain your product?
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-gray-700">
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
