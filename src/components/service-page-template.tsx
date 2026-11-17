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
import {
  BULK_PACKAGE,
  formatUsd,
  perVideoCents,
  videoPackages,
  type VideoPackageId,
} from "@/lib/packages";
import { CALENDLY_URL, EMAIL, PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

export type ServiceSection = {
  title: string;
  /** Plain text; a blank line ("\n\n") starts a new paragraph. */
  body?: string;
  bullets?: string[];
  /** Bullets with a bold lead-in; rendered as a numbered list when `ordered`. */
  items?: { lead: string; text: string }[];
  ordered?: boolean;
  /** One paragraph shown after the list. */
  footnote?: string;
};

/** "Best for" copy for the package table, keyed by package (and "bulk"). */
export type PricingBestFor = Record<VideoPackageId | "bulk", string>;

function isExternal(href: string) {
  return href.startsWith("http");
}

function SectionBlock({ section }: { section: ServiceSection }) {
  return (
    <section className="space-y-5">
      <h2 className="font-display text-4xl font-bold text-gray-800">
        {section.title}
      </h2>
      {section.body
        ? section.body.split("\n\n").map((paragraph) => (
            <p key={paragraph} className="text-lg leading-8 text-gray-600">
              {paragraph}
            </p>
          ))
        : null}
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
      {section.items ? (
        section.ordered ? (
          <ol className="list-decimal space-y-4 pl-6 text-lg leading-8 text-gray-700 marker:font-bold marker:text-[#FF3333]">
            {section.items.map((item) => (
              <li key={item.lead}>
                <strong>{item.lead}</strong> {item.text}
              </li>
            ))}
          </ol>
        ) : (
          <ul className="space-y-4 pl-0">
            {section.items.map((item) => (
              <li
                key={item.lead}
                className="flex gap-3 text-lg leading-8 text-gray-700"
              >
                <span className="mt-1 text-[#FF3333]">•</span>
                <span>
                  <strong>{item.lead}</strong> {item.text}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : null}
      {section.footnote ? (
        <p className="text-lg leading-8 text-gray-600">{section.footnote}</p>
      ) : null}
    </section>
  );
}

/** Price table built from lib/packages.ts: no price is typed here or in the page data. */
function PackageTable({ bestFor }: { bestFor: PricingBestFor }) {
  const rows = [
    ...videoPackages.map((videoPackage) => ({
      key: videoPackage.id,
      name: videoPackage.name,
      price: formatUsd(videoPackage.priceCents),
      perVideo:
        videoPackage.videos > 1
          ? formatUsd(perVideoCents(videoPackage))
          : "n/a",
      bestFor: bestFor[videoPackage.id],
    })),
    {
      key: "bulk",
      name: BULK_PACKAGE.name,
      price: "Quoted",
      perVideo: "n/a",
      bestFor: bestFor.bulk,
    },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-lg text-gray-700">
        <thead>
          <tr className="border-b-4 border-gray-800 text-base uppercase tracking-wide text-gray-800">
            <th scope="col" className="py-3 pr-4">
              Package
            </th>
            <th scope="col" className="py-3 pr-4">
              Price
            </th>
            <th scope="col" className="py-3 pr-4">
              Per video
            </th>
            <th scope="col" className="py-3">
              Best for
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              className="border-b-2 border-dashed border-gray-300"
            >
              <th scope="row" className="py-4 pr-4 font-bold text-gray-800">
                {row.name}
              </th>
              <td className="py-4 pr-4 font-bold">{row.price}</td>
              <td className="py-4 pr-4">{row.perVideo}</td>
              <td className="py-4">{row.bestFor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ServicePageTemplateProps = {
  heroLabel: string;
  title: string;
  description: string;
  primaryCta: string;
  /** Where the primary button goes; defaults to the Calendly page. */
  primaryHref?: string;
  secondaryCta: string;
  secondaryHref?: string;
  sections: ServiceSection[];
  /** The pricing block renders only when `pricingTable` is given. */
  pricingTitle?: string;
  pricingBody?: string;
  pricingTable?: PricingBestFor;
  /** Sections shown after the pricing block. */
  sectionsAfterPricing?: ServiceSection[];
  faqs: Faq[];
  finalTitle: string;
  finalBody: string;
  finalSecondary: string;
  finalSecondaryHref?: string;
  /** Show the phone and email line in the final call to action. */
  finalContact?: boolean;
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
  primaryHref = CALENDLY_URL,
  secondaryCta,
  secondaryHref = "/contact#contact-form",
  sections,
  pricingTitle,
  pricingBody,
  pricingTable,
  sectionsAfterPricing = [],
  faqs,
  finalTitle,
  finalBody,
  finalSecondary,
  finalSecondaryHref,
  finalContact = false,
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
                href={primaryHref}
                target={isExternal(primaryHref) ? "_blank" : undefined}
                rel={isExternal(primaryHref) ? "noreferrer" : undefined}
                className="btn-primary text-lg"
              >
                {primaryCta}
              </a>
              <a
                href={secondaryHref}
                target={isExternal(secondaryHref) ? "_blank" : undefined}
                rel={isExternal(secondaryHref) ? "noreferrer" : undefined}
                className="btn-secondary text-lg"
              >
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
              <SectionBlock key={section.title} section={section} />
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

            {pricingTable ? (
              <section id="pricing" className="space-y-5">
                {pricingTitle ? (
                  <h2 className="font-display text-4xl font-bold text-gray-800">
                    {pricingTitle}
                  </h2>
                ) : null}
                {pricingBody ? (
                  <p className="text-lg leading-8 text-gray-600">
                    {pricingBody}
                  </p>
                ) : null}
                <PackageTable bestFor={pricingTable} />
              </section>
            ) : null}

            {sectionsAfterPricing.map((section) => (
              <SectionBlock key={section.title} section={section} />
            ))}

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
          primaryHref={primaryHref}
          secondary={finalSecondary}
          secondaryHref={finalSecondaryHref}
          extra={
            finalContact ? (
              <p className="mb-6 text-lg font-semibold text-gray-700">
                Or call{" "}
                <a href={PHONE_HREF} className="underline">
                  {PHONE_DISPLAY}
                </a>{" "}
                or email{" "}
                <a href={`mailto:${EMAIL}`} className="underline">
                  {EMAIL}
                </a>
                .
              </p>
            ) : undefined
          }
        />
      </main>
    </SiteShell>
  );
}
