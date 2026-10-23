import type { Faq } from "@/components/marketing";
import {
  BULK_PACKAGE,
  formatUsd,
  perVideoCents,
  VIDEO_SPEC,
  videoPackages,
} from "@/lib/packages";
import { PARENT_COMPANY } from "@/lib/site";

/**
 * FAQ answers shared across pages. Anything about price, delivery, or what a
 * package includes is built from lib/packages.ts, so the answers, the FAQ
 * schema, and the pricing cards can never disagree. Page-specific questions
 * (what a SaaS explainer is, white-label basics) stay on their own pages.
 */

const [single, ...bundles] = videoPackages;
const singlePrice = formatUsd(single.priceCents);
const singleDelivery = single.turnaround.replace(/^Delivered/, "delivered");
const bundleLine = bundles
  .map(
    (bundle) =>
      `${bundle.videos} videos for ${formatUsd(bundle.priceCents)} (${formatUsd(perVideoCents(bundle))} each)`,
  )
  .join(" or ");

export const typesFaq: Faq = {
  question: "What kind of videos does Scribebunny make?",
  answer:
    "We're a small animation studio that loves to draw and tell stories. We make hand-drawn whiteboard and 2D animated explainer videos, product demos, onboarding videos, and white-label videos for agencies, mostly for SaaS teams, startups, and service businesses.",
};

export const costFaq: Faq = {
  question: "How much does an explainer video cost at Scribebunny?",
  answer: `One video costs ${singlePrice} and is ${singleDelivery}. You can also buy ${bundleLine}. For ${BULK_PACKAGE.features[0].toLowerCase()}, our team quotes volume pricing.`,
};

export const includedFaq: Faq = {
  question: "What is included in every video?",
  answer: `Every video is ${VIDEO_SPEC.length} long. We write the script, sketch a hand-drawn storyboard, animate it in a whiteboard or 2D style, and add voiceover and background music. You get ${VIDEO_SPEC.revisions}, and we deliver an ${VIDEO_SPEC.delivery} file that you own outright.`,
};

export const turnaroundFaq: Faq = {
  question: "How long does it take to get a video?",
  answer: `A single video is ${singleDelivery}. For 5 and 10 video packages, we plan the delivery schedule with you so each video lands when you need it.`,
};

export const paymentFaq: Faq = {
  question: "How do I pay, and who issues the invoice?",
  answer: `Pick a package in the pricing section and pay online through secure Stripe checkout. Your receipt and invoice come from ${PARENT_COMPANY}, the parent company of Scribebunny.`,
};

export const afterOrderFaq: Faq = {
  question: "What happens after I order?",
  answer:
    "You get a confirmation email with a link to your private project portal. Send us your brief there, and we write the script, sketch the storyboard, animate, and deliver your video. The portal is where we chat, share each video for review, and mark it complete.",
};

export const briefFaq: Faq = {
  question: "What do you need from me to get started?",
  answer:
    "Just your website, what the video should explain, who it's for, and any brand files like your logo and colors. A rough outline is enough; we'll shape the story with you.",
};

export const revisionsFaq: Faq = {
  question: "Can I ask for changes to my video?",
  answer: `Yes. Every video includes ${VIDEO_SPEC.revisions}. Share your notes in your project portal and we'll redraw until the story feels right.`,
};

export const talkFirstFaq: Faq = {
  question: "Can we talk before we order?",
  answer:
    "Of course. Book a free strategy call or request a quote. There's no commitment, and we reply within 24 hours.",
};

/** The home page FAQ, in the order a new visitor wonders about things. */
export const homeFaqs: Faq[] = [
  typesFaq,
  costFaq,
  includedFaq,
  turnaroundFaq,
  paymentFaq,
  afterOrderFaq,
  briefFaq,
  revisionsFaq,
  talkFirstFaq,
];

/** "How much does a SaaS explainer video cost?", answered from the package prices. */
export function serviceCostFaq(service: string): Faq {
  return {
    question: `How much does a ${service} cost?`,
    answer: `At Scribebunny, one ${service} costs ${singlePrice} and is ${singleDelivery}. Need a series? Buy ${bundleLine}. Every video includes the script, storyboard, animation, voiceover, music, and ${VIDEO_SPEC.revisions}.`,
  };
}
