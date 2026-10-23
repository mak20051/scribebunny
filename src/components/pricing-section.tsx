import { Check, Lock } from "lucide-react";
import { CheckoutButton } from "@/components/checkout-button";
import {
  BULK_PACKAGE,
  EVERY_VIDEO_INCLUDES,
  formatUsd,
  perVideoCents,
  savingsCents,
  videoPackages,
} from "@/lib/packages";
import { PARENT_COMPANY } from "@/lib/site";

function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-6 mb-8 flex-1 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-gray-700">
          <Check
            className="mt-1 h-5 w-5 shrink-0 text-[#FF3333]"
            strokeWidth={3}
            aria-hidden="true"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="relative z-10 py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rotate-[-1deg] rounded-full border-2 border-gray-800 bg-[#FFE66D] px-4 py-2 text-base font-bold">
            VIDEO PACKAGES
          </span>
          <h2 className="font-display text-5xl font-bold text-gray-800">
            {"Simple, "}
            <span className="text-[#FF3333]">Upfront</span>
            {" Pricing"}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-700 md:text-xl">
            Pick a package, pay securely online, and we’ll start sketching your
            story.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {videoPackages.map((videoPackage) => {
            const savings = savingsCents(videoPackage);
            return (
              <article
                key={videoPackage.id}
                className={`pricing-card flex flex-col ${
                  videoPackage.featured ? "pricing-featured" : ""
                }`}
              >
                {savings > 0 ? (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border-2 border-gray-800 bg-[#FF3333] px-4 py-1 text-sm font-bold whitespace-nowrap text-white">
                    Save {formatUsd(savings)}
                  </span>
                ) : null}
                <h3 className="font-display text-2xl font-bold text-gray-800">
                  {videoPackage.name}
                </h3>
                <p className="mt-1 text-base text-gray-600">
                  {videoPackage.bestFor}
                </p>
                <p className="mt-4 font-display text-5xl font-bold text-gray-800">
                  {formatUsd(videoPackage.priceCents)}
                </p>
                <p className="mt-1 text-base text-gray-600">
                  {videoPackage.videos > 1
                    ? `${formatUsd(perVideoCents(videoPackage))} per video`
                    : "One-time payment"}
                </p>
                <FeatureList items={videoPackage.features} />
                <CheckoutButton packageId={videoPackage.id} />
              </article>
            );
          })}

          <article className="pricing-card flex flex-col">
            <h3 className="font-display text-2xl font-bold text-gray-800">
              {BULK_PACKAGE.name}
            </h3>
            <p className="mt-1 text-base text-gray-600">
              {BULK_PACKAGE.bestFor}
            </p>
            <p className="mt-4 font-display text-5xl font-bold text-gray-800">
              Custom
            </p>
            <p className="mt-1 text-base text-gray-600">Quoted by our team</p>
            <FeatureList items={BULK_PACKAGE.features} />
            <a
              href="/contact#contact-form"
              className="btn-secondary w-full text-center"
            >
              Contact Team
            </a>
          </article>
        </div>

        <div className="mt-14 rounded-[1.75rem] border-[3px] border-dashed border-gray-800 bg-white px-6 py-8 sm:px-10">
          <h3 className="font-display text-center text-2xl font-bold text-gray-800">
            Every video includes
          </h3>
          <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {EVERY_VIDEO_INCLUDES.map((item) => (
              <li key={item} className="flex items-start gap-2 text-gray-700">
                <Check
                  className="mt-1 h-5 w-5 shrink-0 text-[#FF3333]"
                  strokeWidth={3}
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-base text-gray-600">
          <Lock className="h-5 w-5 shrink-0" aria-hidden="true" />
          Secure checkout by Stripe. Invoices are issued by {PARENT_COMPANY},
          the parent company of Scribebunny.
        </p>
      </div>
    </section>
  );
}
