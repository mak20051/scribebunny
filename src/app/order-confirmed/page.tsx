import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { CALENDLY_URL, PARENT_COMPANY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Order Confirmed | Scribebunny",
  robots: { index: false, follow: false },
};

export default function OrderConfirmedPage() {
  return (
    <SiteShell>
      <main className="relative overflow-x-hidden bg-[linear-gradient(135deg,#FFF5F5_0%,#FFFFFF_50%,#FFF9F0_100%)] px-6 pt-32 pb-24 text-slate-800 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rotate-[-2deg] rounded-full border-2 border-gray-800 bg-[#FFE66D] px-4 py-2 text-sm font-bold">
            Payment received
          </span>
          <h1 className="font-display text-5xl font-bold text-gray-800 md:text-6xl">
            Your video package is confirmed
          </h1>
          <p className="font-handwritten mx-auto mt-6 max-w-2xl text-2xl text-gray-600">
            Thanks for your order. Your receipt and invoice from{" "}
            {PARENT_COMPANY} are on their way to your email, and our team will
            reach out within 24 hours to collect your brief.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-lg"
            >
              Book a Kickoff Call
            </a>
            <Link href="/" className="btn-secondary text-lg">
              Back to Homepage
            </Link>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
