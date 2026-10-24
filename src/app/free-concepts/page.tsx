import type { Metadata } from "next";
import {
  Clapperboard,
  Mail,
  PenTool,
  Search,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { ConceptForm } from "@/components/concept-form";
import { IconTile } from "@/components/icon-tile";
import { JsonLd } from "@/components/json-ld";
import { SimpleFaq, type Faq } from "@/components/marketing";
import { SiteShell } from "@/components/site-shell";
import { breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "3 Free Video Concepts for Your Business | Scribebunny",
  description:
    "Get 3 free animated video concepts researched from your own website and reviewed by our storytellers. In your inbox within 24 hours, no commitment.",
  path: "/free-concepts",
});

const differences = [
  {
    icon: Search,
    title: "We read your website first",
    text: "Every concept starts from your real offer, your audience, and the words you already use, not a blank prompt.",
    tone: "yellow" as const,
  },
  {
    icon: Clapperboard,
    title: "Built like a real video",
    text: "Each one has an opening hook, a scene-by-scene story, and a visual style, ready to become a short animation.",
    tone: "coral" as const,
  },
  {
    icon: UserCheck,
    title: "Reviewed by our storytellers",
    text: "A person on our studio team checks every concept before it reaches you. An AI chat can't vouch for its own answer.",
    tone: "teal" as const,
  },
];

const steps = [
  {
    icon: PenTool,
    title: "Tell us about your business",
    text: "Your name, business email, phone, and website or a few lines about what you do.",
  },
  {
    icon: Sparkles,
    title: "We research and sketch",
    text: "We read your site, find the story, and shape three different directions for your video.",
  },
  {
    icon: Mail,
    title: "Concepts land in your inbox",
    text: "Within 24 hours. Pick a favorite and we can turn it into your finished video.",
  },
];

const faqs: Faq[] = [
  {
    question: "Are the 3 concepts really free?",
    answer:
      "Yes. There's no cost and no commitment. If you love a concept, we can turn it into your video, but you never have to buy anything.",
  },
  {
    question: "How is this different from asking an AI chat?",
    answer:
      "An AI chat only knows what you type into it. We research your actual website and the details you share, shape each concept with our studio's story process, and a person on our team reviews every concept before we send it.",
  },
  {
    question: "What do I get in each concept?",
    answer:
      "A title, the style (whiteboard or 2D animation), the opening hook, a scene-by-scene story, the look and feel, and why it fits your business.",
  },
];

export default function FreeConceptsPage() {
  return (
    <SiteShell>
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema("Free Video Concepts", "/free-concepts")}
      />
      <main className="relative overflow-x-hidden bg-[linear-gradient(135deg,#FFF5F5_0%,#FFFFFF_50%,#FFF9F0_100%)] text-slate-800">
        <section className="relative z-10 px-6 pt-32 pb-16 sm:px-8 lg:px-12 lg:pt-36">
          <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[1fr_1fr]">
            <div className="text-center lg:text-left">
              <span className="mb-6 inline-block rotate-[-2deg] rounded-full border-[3px] border-gray-800 bg-[#FFE66D] px-5 py-2 text-base font-bold text-gray-800 shadow-[4px_4px_0_#2D3748]">
                Free · No commitment
              </span>
              <h1 className="font-display text-[2.75rem] leading-[1.05] font-extrabold text-gray-800 sm:text-6xl">
                {"Get 3 Free Video Concepts for "}
                <span className="text-[#FF3333]">Your Business</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-gray-700 md:text-2xl lg:mx-0">
                We&apos;re a small studio that loves to draw and tell stories.
                Tell us about your business, and we&apos;ll research your
                website and sketch three story directions for a short animated
                video, reviewed by our storytellers and in your inbox within 24
                hours.
              </p>
              <ul className="mt-8 space-y-5 text-left">
                {differences.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <IconTile
                      icon={item.icon}
                      tone={item.tone}
                      className="shrink-0"
                    />
                    <div>
                      <p className="text-lg font-bold text-gray-800">
                        {item.title}
                      </p>
                      <p className="text-gray-700">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div
              id="concept-form"
              className="rounded-[1.75rem] border-4 border-gray-800 bg-white p-6 shadow-[10px_10px_0_#FFE66D] sm:p-8"
            >
              <h2 className="font-display text-3xl font-bold text-gray-800">
                Where should we send your concepts?
              </h2>
              <p className="mt-2 mb-6 text-gray-700">
                Your website helps us research. No website yet? Tell us what you
                do instead.
              </p>
              <ConceptForm />
            </div>
          </div>
        </section>

        <div className="section-divider" />

        <section className="relative z-10 py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
            <h2 className="font-display mb-12 text-center text-5xl font-bold text-gray-800">
              How it works
            </h2>
            <ol className="grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="service-card">
                  <IconTile
                    icon={step.icon}
                    tone={
                      index === 1 ? "coral" : index === 2 ? "teal" : "yellow"
                    }
                  />
                  <h3 className="mb-2 text-2xl font-bold text-gray-800">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-gray-700">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="section-divider" />

        <section className="relative z-10 py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
            <h2 className="font-display mb-12 text-center text-5xl font-bold text-gray-800">
              Questions
            </h2>
            <SimpleFaq items={faqs} />
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
