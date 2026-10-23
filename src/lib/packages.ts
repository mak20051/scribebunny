import type { Faq } from "@/components/marketing";
import { PARENT_COMPANY } from "@/lib/site";

/**
 * Video packages: the single source of truth for prices and what each
 * package includes. Pages, FAQs, schema, llms.txt, checkout and order emails
 * all read from here, so never retype a price or inclusion in page copy.
 *
 *   1 video ─────▶ $299, delivered in 24 to 48 hours
 *   5 videos ────▶ $1,199 ($239.80 each)
 *   10 videos ───▶ $2,199 ($219.90 each)
 *   bulk (10+) ──▶ quoted by the team
 *
 * OWNER TO CONFIRM (2026-10-23): video length, revision rounds, inclusions and
 * ownership mirror the videoexplainers.com single video. Change them here.
 */

export type VideoPackageId = "single" | "five" | "ten";

export type VideoPackage = {
  id: VideoPackageId;
  name: string;
  videos: number;
  priceCents: number;
  turnaround: string;
  bestFor: string;
  features: string[];
  featured?: boolean;
};

export const VIDEO_SPEC = {
  length: "up to 60 seconds",
  revisions: "2 revision rounds",
  delivery: "HD 1080p MP4",
} as const;

/** What every video in every package includes. */
export const EVERY_VIDEO_INCLUDES = [
  "Script written by our storytellers",
  "Hand-drawn storyboard and illustrations",
  "Whiteboard or 2D animation",
  "Voiceover and background music",
  VIDEO_SPEC.revisions,
  `${VIDEO_SPEC.delivery}, and you own the finished video`,
];

export const videoPackages: VideoPackage[] = [
  {
    id: "single",
    name: "1 Video",
    videos: 1,
    priceCents: 29900,
    turnaround: "Delivered in 24 to 48 hours",
    bestFor: "Trying us out, or one clear video for your homepage or launch",
    features: [
      `1 video, ${VIDEO_SPEC.length}`,
      "Delivered in 24 to 48 hours",
      "Script, storyboard, voiceover and music",
      VIDEO_SPEC.revisions,
    ],
  },
  {
    id: "five",
    name: "5 Videos",
    videos: 5,
    priceCents: 119900,
    turnaround: "Delivery schedule planned with you",
    bestFor: "A series for launches, ads, and onboarding",
    featured: true,
    features: [
      `5 videos, ${VIDEO_SPEC.length} each`,
      "Everything in 1 Video, for every video",
      "Delivery schedule planned with you",
      "One consistent look across the series",
    ],
  },
  {
    id: "ten",
    name: "10 Videos",
    videos: 10,
    priceCents: 219900,
    turnaround: "Delivery schedule planned with you",
    bestFor: "Ongoing campaigns and product education",
    features: [
      `10 videos, ${VIDEO_SPEC.length} each`,
      "Everything in 1 Video, for every video",
      "Delivery schedule planned with you",
      "Lowest price per video",
    ],
  },
];

export const BULK_PACKAGE = {
  name: "Bulk Videos",
  bestFor: "Teams and agencies that need more than 10 videos",
  features: [
    "More than 10 videos",
    "Volume pricing",
    "Delivery schedule built around your calendar",
    "Everything in 1 Video, for every video",
  ],
} as const;

const singleVideoCents = videoPackages[0].priceCents;

export function findVideoPackage(id: unknown) {
  return videoPackages.find((videoPackage) => videoPackage.id === id);
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function perVideoCents(videoPackage: VideoPackage) {
  return Math.round(videoPackage.priceCents / videoPackage.videos);
}

export function savingsCents(videoPackage: VideoPackage) {
  return videoPackage.videos * singleVideoCents - videoPackage.priceCents;
}

/** One line for checkout and receipts: length, delivery and revisions. */
export function packageSummary(videoPackage: VideoPackage) {
  const length =
    videoPackage.videos > 1
      ? `${videoPackage.videos} videos, ${VIDEO_SPEC.length} each`
      : `1 video, ${VIDEO_SPEC.length}`;
  return `${length}. ${videoPackage.turnaround}. ${VIDEO_SPEC.revisions} per video.`;
}

const [singleVideo, ...multiVideoPackages] = videoPackages;
const singleTurnaround = singleVideo.turnaround.replace(
  /^Delivered/,
  "delivered",
);

const bundlePrices = multiVideoPackages
  .map(
    (videoPackage) =>
      `${videoPackage.videos} videos cost ${formatUsd(videoPackage.priceCents)}`,
  )
  .join(" and ");

export const pricingFaqs: Faq[] = [
  {
    question: "How much does a video cost at Scribebunny?",
    answer: `One video costs ${formatUsd(singleVideo.priceCents)} and is ${singleTurnaround}. ${bundlePrices}. For more than 10 videos, contact our team for bulk pricing.`,
  },
  {
    question: "What is included in every video?",
    answer: `Every video is ${VIDEO_SPEC.length} and includes ${EVERY_VIDEO_INCLUDES.map((item) => item.charAt(0).toLowerCase() + item.slice(1)).join(", ")}.`,
  },
  {
    question: "How long does it take to get a video?",
    answer: `A single video is ${singleTurnaround}. For 5 and 10 video packages, we plan the delivery schedule with you.`,
  },
  {
    question: "How do I pay for a video package?",
    answer: `Choose a package in the pricing section and pay online through secure Stripe checkout. Invoices are issued by ${PARENT_COMPANY}, the parent company of Scribebunny.`,
  },
];
