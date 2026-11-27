import {
  Gavel,
  Handshake,
  GraduationCap,
  HeartPulse,
  MonitorPlay,
  MousePointerClick,
  Puzzle,
  Scale,
  Stethoscope,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { Faq } from "@/components/marketing";
import { costFaq, serviceCostFaq } from "@/lib/faqs";
import type {
  PricingBestFor,
  ServiceSection,
} from "@/components/service-page-template";
import { formatUsd, VIDEO_SPEC, videoPackages } from "@/lib/packages";
import { CALENDLY_URL, CLIENT_COUNT_DISPLAY, FOUNDING_YEAR } from "@/lib/site";

const [singlePackage, fivePackage, tenPackage] = videoPackages;

/** "Delivered in 24 to 48 hours" -> "delivered in 24 to 48 hours". */
function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
function upperFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Every landing page served by the [vertical] route (src/app/[vertical]).
 * One entry = one page, one sitemap URL, one llms.txt line. To add a page,
 * add an entry here; the route, sitemap and llms.txt pick it up. A slug that
 * is not listed returns 404 (dynamicParams = false).
 */
export type Vertical = {
  /** URL segment: the page lives at /<slug>. */
  slug: string;
  /** Name used in the breadcrumb schema and the llms.txt link. */
  name: string;
  /** One line for the home page "services" cards and llms.txt. */
  summary: string;
  /** <title> and meta description. */
  metaTitle: string;
  metaDescription: string;
  /** ISO date (YYYY-MM-DD) the page content last changed. Bump it when you edit the entry. */
  lastModified: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
  heroLabel: string;
  title: string;
  description: string;
  primaryCta: string;
  /** Primary button target; defaults to the Calendly page. */
  primaryHref?: string;
  secondaryCta: string;
  secondaryHref?: string;
  sections: ServiceSection[];
  /**
   * Pricing copy. Never type a price here: build it from lib/packages.ts
   * (via costFaq or formatUsd). The page shows the pricing block, with a
   * package table, only when `pricingTable` is set.
   */
  pricingTitle: string;
  pricingBody: string;
  pricingTable?: PricingBestFor;
  /** Sections shown after the pricing block. */
  sectionsAfterPricing?: ServiceSection[];
  faqs: Faq[];
  /** Portfolio videos shown on the page: those in this portfolio category, first `portfolioLimit`. */
  portfolioCategory: string;
  portfolioLimit: number;
  portfolioTitle: string;
  portfolioDescription: string;
  /** Extra block rendered after the portfolio. */
  form?: "agency";
  finalTitle: string;
  finalBody: string;
  finalSecondary: string;
  finalSecondaryHref?: string;
  /** Show phone and email in the final call to action. */
  finalContact?: boolean;
  /** Add a Service schema (with the package offers) to the page. */
  serviceSchema?: boolean;
  /** Service schema serviceType; defaults to "Video production". */
  serviceType?: string;
  /** Add VideoObject schema for the portfolio videos (each needs an uploadDate). */
  videoSchema?: boolean;
  topDoodle: LucideIcon;
  sideDoodle: LucideIcon;
};

export const verticals: Vertical[] = [
  {
    slug: "saas-explainer-videos",
    name: "SaaS Explainer Videos",
    summary:
      "Clear, conversion-focused explainer videos for homepages, launches, product overviews, and sales conversations.",
    metaTitle: "SaaS Explainer Videos for Launches and Sales | Scribebunny",
    metaDescription:
      "Scribebunny creates SaaS explainer videos that help teams simplify product messaging, improve understanding, and support launches, sales, and conversion.",
    lastModified: "2026-10-23",
    changeFrequency: "monthly",
    priority: 0.8,
    heroLabel: "Built for SaaS teams that need a clearer product story",
    title:
      "SaaS Explainer Videos That Make Complex Products Easier to Understand",
    description:
      "We help SaaS teams turn technical products, features, and workflows into clear, conversion-focused explainer videos for homepages, launches, and sales support.",
    primaryCta: "Book a Strategy Call",
    secondaryCta: "Request a Quote",
    sections: [
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
    ],
    pricingTitle: "Starting point",
    pricingBody: costFaq.answer,
    faqs: [
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
    ],
    portfolioCategory: "SaaS Explainers",
    portfolioLimit: 4,
    portfolioTitle: "SaaS explainer video examples",
    portfolioDescription:
      "A shortlist of portfolio videos mapped to the SaaS Explainers category for this page.",
    finalTitle: "Need a clearer way to explain your SaaS product?",
    finalBody:
      "We can help you shape a sharper product story and turn it into a video asset your team can reuse across channels.",
    finalSecondary: "Talk to Us About Your Project",
    topDoodle: MonitorPlay,
    sideDoodle: TrendingUp,
  },
  {
    slug: "product-demo-onboarding-videos",
    name: "Product Demo and Onboarding Videos",
    summary:
      "Walkthroughs, feature explainers, onboarding assets, and user education videos that help customers understand your product faster.",
    metaTitle: "Product Demo and Onboarding Videos for SaaS | Scribebunny",
    metaDescription:
      "Create product demo, onboarding, and feature explainer videos that help users understand your software faster and support activation, training, and sales.",
    lastModified: "2026-10-23",
    changeFrequency: "monthly",
    priority: 0.8,
    heroLabel: "Built for teams responsible for product understanding",
    title:
      "Product Demo and Onboarding Videos That Make Product Education Easier to Scale",
    description:
      "We create product walkthroughs, feature explainers, onboarding videos, and user education content that help SaaS teams improve understanding, activation, and adoption.",
    primaryCta: "Book a Strategy Call",
    secondaryCta: "View Our Work",
    secondaryHref: "/work",
    sections: [
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
    ],
    pricingTitle: "Starting point",
    pricingBody: costFaq.answer,
    faqs: [
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
        question: "Can these videos support sales as well as customer success?",
        answer:
          "Yes. Product demo videos can help both prospects and customers understand workflows, features, and outcomes more efficiently.",
      },
      {
        question: "Can you make a full onboarding video series?",
        answer:
          "Yes. Our 5 and 10 video packages are made for series like onboarding flows and feature walkthroughs, with one consistent look across every video and a delivery schedule we plan with you.",
      },
      serviceCostFaq("product demo or onboarding video"),
    ],
    portfolioCategory: "Product Demos & Onboarding",
    portfolioLimit: 4,
    portfolioTitle: "Product demo and onboarding examples",
    portfolioDescription:
      "Relevant portfolio samples mapped to Product Demos & Onboarding for this service page.",
    finalTitle:
      "Need product education content your team can use again and again?",
    finalBody:
      "We can help you turn product workflows into clear, reusable demo and onboarding assets.",
    finalSecondary: "Request a Quote",
    topDoodle: MousePointerClick,
    sideDoodle: GraduationCap,
  },
  {
    slug: "white-label-video-production",
    name: "White-Label Video Production",
    summary:
      "Reliable behind-the-scenes video fulfillment for agencies that want quality delivery without building in-house production capacity.",
    metaTitle: "White-Label Explainer Video Production | Scribebunny",
    metaDescription:
      "Partner with Scribebunny for white-label explainer, demo, and animation production. Reliable video fulfillment for agencies without adding in-house overhead.",
    lastModified: "2026-10-23",
    changeFrequency: "monthly",
    priority: 0.8,
    heroLabel: "Built for agencies that need a trusted production partner",
    title:
      "White-Label Video Production for Agencies That Need Reliable Delivery",
    description:
      "Scribebunny helps agencies fulfill explainer, demo, onboarding, and video production needs behind the scenes, with dependable communication, clear workflow, and scalable delivery.",
    primaryCta: "Book a Strategy Call",
    secondaryCta: "Agency Partner Inquiry",
    secondaryHref: "#agency-form",
    sections: [
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
        title: "A production model designed to support your client delivery",
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
    ],
    pricingTitle: "Engagement model",
    pricingBody: costFaq.answer,
    faqs: [
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
          "Agencies can order our 1, 5, or 10 video packages, or talk to us about volume pricing for more than 10 videos. Every order gets its own private project portal, so each of your clients' videos stays organized.",
      },
      serviceCostFaq("white-label explainer video"),
    ],
    portfolioCategory: "White-Label / Agency Work",
    portfolioLimit: 6,
    portfolioTitle: "White-label and agency examples",
    portfolioDescription:
      "Relevant portfolio samples mapped to White-Label / Agency Work for this service page.",
    form: "agency",
    finalTitle: "Need a reliable white-label video partner for your agency?",
    finalBody:
      "Let’s talk about your workflow, client needs, and what a smoother production partnership could look like.",
    finalSecondary: "Agency Partner Inquiry",
    topDoodle: Handshake,
    sideDoodle: Puzzle,
  },
  {
    slug: "explainer-videos-for-lawyers",
    name: "Explainer Videos for Lawyers",
    summary: `An explainer video for lawyers is a short animated video, ${VIDEO_SPEC.length}, that explains one thing your clients keep asking about: what a claim involves, how a case moves, what happens at your first meeting.`,
    metaTitle: `Explainer Videos for Lawyers | From ${formatUsd(singlePackage.priceCents)} | Scribebunny`,
    metaDescription:
      "Animated explainer videos for lawyers and law firms: script, storyboard, animation and voiceover. Start with 3 free concepts.",
    lastModified: "2026-11-17",
    changeFrequency: "monthly",
    priority: 0.8,
    heroLabel:
      "Built for law firms that want clients to understand the process",
    title: "Animated Explainer Videos for Lawyers and Law Firms",
    description: `An explainer video for lawyers is a short animated video, ${VIDEO_SPEC.length}, that explains one thing your clients keep asking about: what a claim involves, how a case moves, what happens at your first meeting. Scribebunny writes the script, draws the storyboard, animates it and adds voiceover and music. Nobody from your firm has to appear on camera. One video starts at ${formatUsd(singlePackage.priceCents)}, and you can see 3 free concepts before you pay for anything.`,
    primaryCta: "Get 3 Free Concepts",
    primaryHref: "/free-concepts",
    secondaryCta: "Book a Call",
    secondaryHref: CALENDLY_URL,
    sections: [
      {
        title: "What an explainer video does for a law firm",
        body: "Many people who contact a law firm are unsure what happens next. Questions like how long it takes, what to bring and what it costs to start tend to repeat.\n\nA short animated video answers those once, in plain language, on the page where the question comes up. It can sit on a practice-area page, in a follow-up email or in a social post.\n\nAnimation also means no filming day. There are no staff on camera and no client footage in the video. You give us the topic and your own wording for anything that needs to be exact, and we do the drawing.",
      },
      {
        title: "Videos law firms ask us for",
        items: [
          {
            lead: "Practice-area explainer.",
            text: "One video per practice area, placed on that service page. It says who the practice area is for and what a first step looks like.",
          },
          {
            lead: "How the process works.",
            text: "The stages of a case or claim, in order, so clients know what to expect.",
          },
          {
            lead: "Firm introduction.",
            text: "A short homepage video on who you help and how a first conversation goes.",
          },
          {
            lead: "FAQ-answer clips.",
            text: "One question per video, 30 to 60 seconds, for pages and emails that answer common questions.",
          },
          {
            lead: "Social cuts.",
            text: "A shorter version of any of the above for the channels your firm already uses.",
          },
        ],
      },
    ],
    pricingTitle: "Explainer video cost for lawyers: pricing",
    pricingBody: `Every video is ${VIDEO_SPEC.length} and includes the script, a hand-drawn storyboard, whiteboard or 2D animation, voiceover and music, ${VIDEO_SPEC.revisions}, and an ${VIDEO_SPEC.delivery} that you own.`,
    pricingTable: {
      single: `One clear video, such as a practice-area page; ${lowerFirst(singlePackage.turnaround)}`,
      five: `A series, such as a video for each practice area; ${lowerFirst(fivePackage.turnaround)}`,
      ten: `Ongoing campaigns and a larger library; ${lowerFirst(tenPackage.turnaround)}`,
      bulk: "More than 10 videos",
    },
    sectionsAfterPricing: [
      {
        title: "How it works",
        items: [
          {
            lead: "Free concepts.",
            text: "Tell us about your firm and what the video should explain. We read your website and send 3 different story directions within 24 hours, reviewed by our storytellers. There is no cost and no commitment.",
          },
          {
            lead: "Brief.",
            text: "After you order, you get a private project portal. Send your brief there: your website, what the video should explain, who it is for, and your logo and colors.",
          },
          {
            lead: "Script and storyboard.",
            text: "We write the script and sketch a hand-drawn storyboard for your review.",
          },
          {
            lead: "Animation and delivery.",
            text: `We animate it, add voiceover and music, and deliver an ${VIDEO_SPEC.delivery}. ${upperFirst(VIDEO_SPEC.revisions)} are included, and you own the finished video.`,
          },
        ],
        ordered: true,
        footnote: `Scribebunny has been making animated videos since ${FOUNDING_YEAR} for ${CLIENT_COUNT_DISPLAY} clients.`,
      },
      {
        title: "Disclaimers, languages and review",
        items: [
          {
            lead: "Disclaimers.",
            text: "If your firm uses a disclaimer on its marketing, we can add it to the video as on-screen text. You supply the wording; we do not write legal text for you.",
          },
          {
            lead: "Languages.",
            text: "We can make videos in languages other than English. Tell us which language you need when you order.",
          },
          {
            lead: "Your advertising rules.",
            text: "Rules for lawyer advertising differ by state and by jurisdiction. You, not Scribebunny, are responsible for checking the rules that apply to your firm and for approving the final video before it goes live. We do not offer legal advice or promise that a video meets any rule. This is general information, not legal advice.",
          },
        ],
      },
    ],
    faqs: [
      serviceCostFaq("law firm explainer video"),
      {
        question: "How long is a law firm explainer video?",
        answer: `${upperFirst(VIDEO_SPEC.length)}. That is enough time to explain one practice area or one stage of a case.`,
      },
      {
        question: "Do I need to be on camera?",
        answer:
          "No. The video is animated with a voiceover, so nobody from your firm needs to be filmed. You review the script and storyboard before we animate.",
      },
      {
        question:
          "Can you add a disclaimer or make the video in another language?",
        answer:
          "Yes to both. We can add disclaimer text on screen, and you provide the wording. We can also make videos in languages other than English; tell us which one you need when you order.",
      },
      {
        question: "How fast can I get a law firm explainer video?",
        answer: `A single video is ${lowerFirst(singlePackage.turnaround)}. For 5 or 10 videos, we plan the delivery schedule with you.`,
      },
      {
        question: "Do lawyer videos need to follow advertising rules?",
        answer:
          "Rules for lawyer advertising differ by state, so check the ones that apply to your firm before you publish. We do not give legal advice.",
      },
      {
        question: "Who owns the video?",
        answer: `You do. The finished ${VIDEO_SPEC.delivery} is yours to keep and use.`,
      },
    ],
    portfolioCategory: "Lawyers",
    portfolioLimit: 2,
    portfolioTitle: "Law firm explainer video examples",
    portfolioDescription: "Animated explainer videos we have made for lawyers.",
    finalTitle: "See your firm's video before you buy",
    finalBody:
      "Tell us what you want a client to understand. We will send 3 free concepts within 24 hours, no commitment.",
    finalSecondary: "Book a 30-minute call",
    finalSecondaryHref: CALENDLY_URL,
    finalContact: true,
    serviceSchema: true,
    topDoodle: Scale,
    sideDoodle: Gavel,
  },
  {
    slug: "explainer-videos-for-medical-practices",
    name: "Explainer Videos for Medical Practices",
    summary: `A patient education video for a clinic is a short animated video, ${VIDEO_SPEC.length}, that explains one thing your patients keep asking about: what a procedure involves, what to expect at a first visit, how aftercare works.`,
    metaTitle: "Patient Education Videos for Clinics | Scribebunny",
    metaDescription: `Animated patient education videos for clinics and small practices. Script, storyboard, voiceover and animation from ${formatUsd(singlePackage.priceCents)}. Start with 3 free concepts.`,
    lastModified: "2026-11-19",
    changeFrequency: "monthly",
    priority: 0.8,
    heroLabel:
      "Built for small practices that want patients to understand what comes next",
    title: "Patient Education Videos for Clinics and Small Practices",
    description: `A patient education video for a clinic is a short animated video, ${VIDEO_SPEC.length}, that explains one thing your patients keep asking about: what a procedure involves, what to expect at a first visit, how aftercare works. Scribebunny writes the script, draws the storyboard, animates it and adds voiceover and music. Nobody from your practice appears on camera and no patient photos or footage are needed. One video starts at ${formatUsd(singlePackage.priceCents)}, and you can see 3 free concepts before you pay for anything.`,
    primaryCta: "Get 3 Free Concepts",
    primaryHref: "/free-concepts",
    secondaryCta: "Book a 30-minute call",
    secondaryHref: CALENDLY_URL,
    sections: [
      {
        title: "Videos small practices use us for",
        body: "Each one answers a question patients already ask. You give us the topic and your own wording for anything clinical; we do the drawing.",
        items: [
          {
            lead: "Explain a procedure or treatment.",
            text: "One video per service, placed on that service page or sent before an appointment. It walks through the steps in plain language, in the order you describe them.",
          },
          {
            lead: 'New-patient "what to expect".',
            text: "Booking, arriving, paperwork, the first visit. It answers the questions the front desk hears most.",
          },
          {
            lead: "Condition and aftercare explainers.",
            text: "One topic per video. The wording on anything clinical comes from your team, and your clinical team approves the script before we animate.",
          },
          {
            lead: "Services overview for your website.",
            text: "A short homepage video on who you help and what your practice offers.",
          },
          {
            lead: "Social cuts.",
            text: "A shorter version of any video above for the channels your practice already uses.",
          },
        ],
      },
      {
        title: "Why a custom video instead of a library",
        body: "Ready-made libraries and AI video tools are quick, and they suit some jobs. A library video is made for any practice. A custom video is made for yours: your services, your way of explaining things, your voice and colors.\n\nThat is the difference. If you need a stock explanation of a common topic, a library may be enough. If you want patients to see your practice, that is a custom video.",
      },
    ],
    pricingTitle: "Patient education video cost: pricing",
    pricingBody: `Every video is ${VIDEO_SPEC.length} and includes the script, a hand-drawn storyboard, whiteboard or 2D animation, voiceover and music, ${VIDEO_SPEC.revisions}, and an ${VIDEO_SPEC.delivery} that you own.`,
    pricingTable: {
      single: `One clear video, such as a service page; ${lowerFirst(singlePackage.turnaround)}`,
      five: `A series, such as one video per service; ${lowerFirst(fivePackage.turnaround)}`,
      ten: `An ongoing library of patient videos; ${lowerFirst(tenPackage.turnaround)}`,
      bulk: "More than 10 videos",
    },
    sectionsAfterPricing: [
      {
        title: "How it works",
        items: [
          {
            lead: "Free concepts.",
            text: "Tell us about your practice and what the video should explain. We read your website and send 3 different story directions within 24 hours, reviewed by our storytellers. There is no cost and no commitment.",
          },
          {
            lead: "Brief.",
            text: "After you order, you get a private project portal. Send your brief there.",
          },
          {
            lead: "Script and storyboard.",
            text: "We write the script and sketch a hand-drawn storyboard. You review and approve both before we animate, so your clinical team can check the wording first.",
          },
          {
            lead: "Animation and delivery.",
            text: `We animate it, add voiceover and music, and tell you in the portal when it is ready for review. You send changes there; ${VIDEO_SPEC.revisions} are included, and you own the finished video.`,
          },
        ],
        ordered: true,
        footnote: `Scribebunny has been making animated videos since ${FOUNDING_YEAR} for ${CLIENT_COUNT_DISPLAY} clients.`,
      },
      {
        title: "Languages, disclaimers and clinical wording",
        items: [
          {
            lead: "Languages.",
            text: "We can make versions in other languages. Tell us which one you need when you order.",
          },
          {
            lead: "Disclaimers.",
            text: "If your practice uses a disclaimer, we can add it to the video as on-screen text. You supply the wording.",
          },
          {
            lead: "Clinical wording.",
            text: "The practice has the final say on anything clinical. We do not write medical claims for you, and a video should supplement the conversation with your clinician, not replace it. We do not give legal or medical advice. Questions about the process?",
            link: { label: "Contact us", href: "/contact" },
          },
        ],
      },
      {
        title: "Video marketing for doctors: where to use these videos",
        items: [
          {
            lead: "Service pages on your website.",
            text: "One video per treatment or service, next to the text that describes it.",
          },
          {
            lead: "YouTube.",
            text: "Your own channel, so patients can find the video outside your site.",
          },
          {
            lead: "Waiting-room screens.",
            text: "A looped set of short videos while patients wait.",
          },
          {
            lead: "Email and appointment reminders.",
            text: 'A link to the "what to expect" video before a first visit.',
          },
          {
            lead: "Social.",
            text: "Shorter cuts for the channels your practice already uses.",
          },
        ],
        footnote:
          "Start with the question your front desk answers most often. That is usually the first video to make.",
      },
    ],
    faqs: [
      serviceCostFaq("patient education video"),
      {
        question: "How long are the videos?",
        answer: `${upperFirst(VIDEO_SPEC.length)}. That is enough for one procedure, one service or one question.`,
      },
      {
        question: "Do you need patient photos or footage?",
        answer:
          "No. The video is animated with a voiceover, so no patient images or footage are needed and nobody from your practice has to be filmed.",
      },
      {
        question: "Can you make videos in other languages or add a disclaimer?",
        answer:
          "Yes. We can make versions in other languages, and we can add a disclaimer as on-screen text; you provide the wording.",
      },
      {
        question: "How fast can I get a video?",
        answer: `A single video is ${lowerFirst(singlePackage.turnaround)}. For 5 or 10 videos, we plan the delivery schedule with you.`,
      },
      {
        question: "Will the video replace the doctor's explanation?",
        answer:
          "No. It is meant to support the conversation with your clinician, not replace it. Your practice has the final say on all clinical wording.",
      },
      {
        question: "Who owns the video?",
        answer: `You do. The finished ${VIDEO_SPEC.delivery} is yours to keep and use.`,
      },
    ],
    portfolioCategory: "Medical",
    portfolioLimit: 3,
    portfolioTitle: "Clinic video examples",
    portfolioDescription:
      "Animated videos we have made for clinics and specialty practices.",
    finalTitle: "See your practice's video before you buy",
    finalBody:
      "Tell us what you want patients to understand. We will send 3 free concepts within 24 hours, no commitment.",
    finalSecondary: "Book a 30-minute call",
    finalSecondaryHref: CALENDLY_URL,
    finalContact: true,
    serviceSchema: true,
    serviceType:
      "Patient education animated video production for medical practices",
    videoSchema: true,
    topDoodle: Stethoscope,
    sideDoodle: HeartPulse,
  },
];

export function getVertical(slug: string): Vertical | undefined {
  return verticals.find((vertical) => vertical.slug === slug);
}
