import { Check } from "lucide-react";
import Link from "next/link";

const points = [
  "Researched from your own website",
  "Hook, scene-by-scene story, and visual style",
  "Reviewed by our storytellers, within 24 hours",
];

/** Home page invitation to the free 3-concept offer. */
export function ConceptOffer() {
  return (
    <section
      id="free-concepts"
      className="relative z-10 overflow-hidden bg-[#FFE66D] py-16"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:px-12">
        <div className="text-center lg:text-left">
          <span className="mb-4 inline-block rotate-[-1deg] rounded-full border-2 border-gray-800 bg-white px-4 py-2 text-base font-bold">
            NOT READY TO BUY?
          </span>
          <h2 className="font-display text-4xl font-bold text-gray-800 md:text-5xl">
            Get 3 free video concepts for your business
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-800 md:text-xl">
            Not another AI chat answer. We read your website, find your story,
            and sketch three directions for a short animated video.
          </p>
        </div>
        <div className="rounded-[1.75rem] border-4 border-gray-800 bg-white p-6 shadow-[8px_8px_0_#2D3748] sm:p-8">
          <ul className="space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-gray-800">
                <Check
                  className="mt-1 h-5 w-5 shrink-0 text-[#FF3333]"
                  strokeWidth={3}
                  aria-hidden="true"
                />
                {point}
              </li>
            ))}
          </ul>
          <Link
            href="/free-concepts"
            className="btn-primary mt-6 block w-full text-center"
          >
            Get My 3 Free Concepts
          </Link>
          <p className="mt-3 text-center text-sm text-gray-600">
            Free · No commitment
          </p>
        </div>
      </div>
    </section>
  );
}
