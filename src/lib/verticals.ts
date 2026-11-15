import {
  Handshake,
  GraduationCap,
  MonitorPlay,
  MousePointerClick,
  Puzzle,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { Faq } from "@/components/marketing";
import { serviceCostFaq } from "@/lib/faqs";
import type { ServiceSection } from "@/components/service-page-template";

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
  secondaryCta: string;
  secondaryHref?: string;
  sections: ServiceSection[];
  pricingTitle: string;
  pricingBody: string;
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
    pricingBody:
      "SaaS explainer video packages typically start from $3,500 depending on scope, length, style, and production requirements.",
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
    pricingBody:
      "Product demo and onboarding video packages typically start from $2,500 depending on complexity, number of workflows, and format requirements.",
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
    title: "White-Label Video Production for Agencies That Need Reliable Delivery",
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
    pricingBody:
      "White-label agency partnerships are typically scoped as custom engagements or monthly support plans, with starting points from $5,000 depending on volume, delivery model, and service mix.",
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
          "Agencies can buy our 1, 5, or 10 video packages online, or talk to us about volume pricing for more than 10 videos. Every order gets its own private project portal, so each of your clients' videos stays organized.",
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
];

export function getVertical(slug: string): Vertical | undefined {
  return verticals.find((vertical) => vertical.slug === slug);
}
