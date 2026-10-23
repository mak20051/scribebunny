import { CheckoutButton } from "@/components/checkout-button";
import {
  formatUsd,
  perVideoCents,
  savingsCents,
  videoPackages,
} from "@/lib/packages";
import { PARENT_COMPANY } from "@/lib/site";

export function PricingSection() {
  return (
    <section id="pricing" className="relative z-10 py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rotate-[-1deg] rounded-full border-2 border-gray-800 bg-[#FFE66D] px-4 py-2 text-sm font-bold">
            VIDEO PACKAGES
          </span>
          <h2 className="font-display text-5xl font-bold text-gray-800">
            {"Simple, "}
            <span className="text-[#FF3333]">Upfront</span>
            {" Pricing"}
          </h2>
          <p className="font-handwritten mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            Pick a package, pay securely online, and we’ll get started on your
            videos.
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
                <p className="mt-4 font-display text-5xl font-bold text-gray-800">
                  {formatUsd(videoPackage.priceCents)}
                </p>
                <p className="mt-2 text-gray-600">
                  {videoPackage.videos > 1
                    ? `${formatUsd(perVideoCents(videoPackage))} per video`
                    : "One-time payment"}
                </p>
                <p className="mt-6 mb-8 flex-1 font-semibold text-gray-700">
                  {videoPackage.turnaround ??
                    `${videoPackage.videos} videos, paid upfront`}
                </p>
                <CheckoutButton packageId={videoPackage.id} />
              </article>
            );
          })}

          <article className="pricing-card flex flex-col">
            <h3 className="font-display text-2xl font-bold text-gray-800">
              Bulk Videos
            </h3>
            <p className="mt-4 font-display text-5xl font-bold text-gray-800">
              Custom
            </p>
            <p className="mt-2 text-gray-600">More than 10 videos</p>
            <p className="mt-6 mb-8 flex-1 font-semibold text-gray-700">
              Talk to our team about volume pricing and delivery.
            </p>
            <a
              href="/contact#contact-form"
              className="btn-secondary w-full text-center"
            >
              Contact Team
            </a>
          </article>
        </div>

        <p className="mt-12 text-center text-sm text-gray-600">
          Secure checkout by Stripe. Invoices are issued by {PARENT_COMPANY},
          the parent company of Scribebunny.
        </p>
      </div>
    </section>
  );
}
