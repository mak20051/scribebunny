import type { Metadata } from "next";
import { Mail, PenTool, Clapperboard } from "lucide-react";
import Link from "next/link";
import { IconTile } from "@/components/icon-tile";
import { SiteShell } from "@/components/site-shell";
import { VIDEO_SPEC } from "@/lib/packages";
import { portalLink } from "@/lib/portal";
import {
  describeOrder,
  fulfil,
  paymentsEnabled,
  webhookConfigured,
  type Order,
} from "@/lib/payments";
import { CALENDLY_URL, EMAIL, PARENT_COMPANY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Order Confirmed | Scribebunny",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ session_id?: string }> };

async function loadOrder(sessionId?: string): Promise<Order | null> {
  if (!sessionId || !paymentsEnabled()) return null;
  try {
    // The webhook owns fulfilment once it is set up; until then this page does it.
    return webhookConfigured()
      ? await describeOrder(sessionId)
      : await fulfil(sessionId);
  } catch (error) {
    console.error("[order-confirmed] could not load order:", error);
    return null;
  }
}

const NEXT_STEPS = [
  {
    icon: Mail,
    title: "Send us your brief",
    text: "Open your project portal and tell us your website, what the video should explain, who it's for, and any brand files.",
  },
  {
    icon: PenTool,
    title: "We write and sketch",
    text: "Our storytellers write the script and sketch the storyboard for your video.",
  },
  {
    icon: Clapperboard,
    title: "We animate and deliver",
    text: `Your finished video arrives with ${VIDEO_SPEC.revisions} to get it just right.`,
  },
];

export default async function OrderConfirmedPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;
  const order = await loadOrder(sessionId);
  const paid = order?.paid ?? false;
  const portalHref = order?.paid
    ? portalLink(order.reference, "client")
    : `mailto:${EMAIL}?subject=${encodeURIComponent("Brief for my video")}`;

  return (
    <SiteShell>
      <main className="relative overflow-x-hidden bg-[linear-gradient(135deg,#FFF5F5_0%,#FFFFFF_50%,#FFF9F0_100%)] px-6 pt-32 pb-24 text-slate-800 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rotate-[-2deg] rounded-full border-2 border-gray-800 bg-[#FFE66D] px-4 py-2 text-base font-bold">
            {order && !paid ? "Payment processing" : "Payment received"}
          </span>
          <h1 className="font-display text-5xl font-bold text-gray-800 md:text-6xl">
            {order && !paid
              ? "We're confirming your payment"
              : "Your story is on our drawing board!"}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-gray-700 md:text-2xl">
            {order && !paid
              ? "Stripe is still confirming your payment. You'll get an email as soon as it goes through."
              : `Thank you for your order. We're a small studio that loves to draw and tell stories, and we can't wait to start on yours. Your receipt and invoice from ${PARENT_COMPANY} are on their way to your email.`}
          </p>
        </div>

        {order ? (
          <dl className="mx-auto mt-12 grid max-w-2xl gap-x-8 gap-y-4 rounded-[1.75rem] border-4 border-gray-800 bg-white p-8 shadow-[10px_10px_0_#FFE66D] sm:grid-cols-2">
            {[
              ["Package", order.packageName],
              ["Amount paid", order.amount],
              ["Order number", order.reference],
              ["Confirmation sent to", order.email],
              ...(order.videoPackage
                ? [["Delivery", order.videoPackage.turnaround]]
                : []),
              ...(order.invoiceNumber
                ? [["Invoice", order.invoiceNumber]]
                : []),
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm font-bold tracking-wide text-gray-500 uppercase">
                  {label}
                </dt>
                <dd className="mt-1 text-lg font-semibold break-words text-gray-800">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mx-auto mt-16 max-w-5xl">
          <h2 className="font-display text-center text-4xl font-bold text-gray-800">
            What happens next
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {NEXT_STEPS.map((step, index) => (
              <li key={step.title} className="service-card">
                <IconTile
                  icon={step.icon}
                  tone={index === 1 ? "coral" : index === 2 ? "teal" : "yellow"}
                />
                <h3 className="text-xl font-bold text-gray-800">
                  {index + 1}. {step.title}
                </h3>
                <p className="mt-2 text-gray-700">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-4">
          <a href={portalHref} className="btn-primary text-lg">
            {order?.paid ? "Open Your Project Portal" : "Send Your Brief"}
          </a>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-lg"
          >
            Book a Kickoff Call
          </a>
        </div>
        {order?.invoiceUrl ? (
          <p className="mt-8 text-center text-base text-gray-600">
            <a
              href={order.invoiceUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[#FF3333] underline"
            >
              View your invoice
            </a>
          </p>
        ) : null}
        <p className="mt-6 text-center text-base text-gray-600">
          <Link href="/" className="underline hover:text-[#FF3333]">
            Back to homepage
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
