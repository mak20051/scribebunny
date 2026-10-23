import {
  Pencil,
  Rabbit,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { FinalCta, PageDivider, type Faq } from "@/components/marketing";
import { SiteShell } from "@/components/site-shell";
import { VideoCard, type Video } from "@/components/video-card";
import { CALENDLY_URL } from "@/lib/site";

export type ServiceSection = {
  title: string;
  body?: string;
  bullets?: string[];
};

type ServicePageTemplateProps = {
  heroLabel: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  secondaryHref?: string;
  sections: ServiceSection[];
  pricingTitle?: string;
  pricingBody?: string;
  faqs: Faq[];
  finalTitle: string;
  finalBody: string;
  finalSecondary: string;
  topDoodle?: LucideIcon;
  sideDoodle?: LucideIcon;
  extraTop?: React.ReactNode;
  portfolioTitle?: string;
  portfolioDescription?: string;
  portfolioVideos?: Video[];
  formSection?: React.ReactNode;
};

export function ServicePageTemplate({
  heroLabel,
  title,
  description,
  primaryCta,
  secondaryCta,
  secondaryHref = "/contact#contact-form",
  sections,
  faqs,
  finalTitle,
  finalBody,
  finalSecondary,
  topDoodle: TopDoodle = Pencil,
  sideDoodle: SideDoodle = Sparkles,
  extraTop,
  portfolioTitle = "Relevant portfolio samples",
  portfolioDescription = "Selected videos related to this service offering.",
  portfolioVideos = [],
  formSection,
}: ServicePageTemplateProps) {
  return (
    <SiteShell>
      <main className="relative overflow-x-hidden bg-[linear-gradient(135deg,#FFF5F5_0%,#FFFFFF_50%,#FFF9F0_100%)] text-slate-800">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <TopDoodle className="absolute left-[6%] top-28 h-14 w-14 opacity-15" />
          <SideDoodle className="absolute right-[8%] top-56 h-12 w-12 opacity-15" />
          <Rabbit className="absolute left-[10%] top-[38%] h-10 w-10 opacity-10" />
          <Target className="absolute right-[12%] bottom-[24%] h-12 w-12 opacity-10" />
        </div>

        <section className="relative z-10 px-6 pt-32 pb-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <span className="mb-4 inline-block rotate-[-2deg] rounded-full border-2 border-gray-800 bg-[#FFE66D] px-4 py-2 text-base font-bold">
              {heroLabel}
            </span>
            <h1 className="font-display text-5xl font-bold leading-tight text-gray-800 md:text-6xl">
              {title}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-gray-700 md:text-2xl">
              {description}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-lg"
              >
                {primaryCta}
              </a>
              <a href={secondaryHref} className="btn-secondary text-lg">
                {secondaryCta}
              </a>
            </div>
            {extraTop ? <div className="mt-10">{extraTop}</div> : null}
          </div>
        </section>

        <PageDivider />

        <section className="relative z-10 px-6 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl space-y-16">
            {sections.map((section) => (
              <section key={section.title} className="space-y-5">
                <h2 className="font-display text-4xl font-bold text-gray-800">
                  {section.title}
                </h2>
                {section.body ? (
                  <p className="text-lg leading-8 text-gray-600">
                    {section.body}
                  </p>
                ) : null}
                {section.bullets ? (
                  <ul className="space-y-4 pl-0">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-3 text-lg leading-8 text-gray-700"
                      >
                        <span className="mt-1 text-[#FF3333]">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {portfolioVideos.length ? (
              <section className="space-y-5">
                <h2 className="font-display text-4xl font-bold text-gray-800">
                  {portfolioTitle}
                </h2>
                <p className="text-lg leading-8 text-gray-600">
                  {portfolioDescription}
                </p>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {portfolioVideos.map((video, index) => (
                    <VideoCard
                      key={`${video.id}-${index}`}
                      video={video}
                      priority={index < 2}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {formSection || null}

            <section className="space-y-5">
              <h2 className="font-display text-4xl font-bold text-gray-800">
                FAQs
              </h2>
              <div className="space-y-6">
                {faqs.map((faq) => (
                  <article
                    key={faq.question}
                    className="border-b-2 border-dashed border-gray-300 pb-6 last:border-b-0"
                  >
                    <h3 className="text-xl font-bold text-gray-800">
                      {faq.question}
                    </h3>
                    <p className="mt-3 text-lg leading-8 text-gray-600">
                      {faq.answer}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <FinalCta
          title={finalTitle}
          description={finalBody}
          primary={primaryCta}
          secondary={finalSecondary}
        />
      </main>
    </SiteShell>
  );
}
