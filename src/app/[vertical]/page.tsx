import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgencyInquiryForm } from "@/components/agency-inquiry-form";
import { JsonLd } from "@/components/json-ld";
import { ServicePageTemplate } from "@/components/service-page-template";
import { fullPortfolio } from "@/lib/portfolio";
import {
  breadcrumbSchema,
  faqSchema,
  pageMetadata,
  pageServiceSchema,
  videoObjectsSchema,
} from "@/lib/seo";
import { getVertical, verticals } from "@/lib/verticals";

// Only slugs listed in src/lib/verticals.ts exist; anything else is a 404.
export const dynamicParams = false;

type Props = { params: Promise<{ vertical: string }> };

export function generateStaticParams() {
  return verticals.map((vertical) => ({ vertical: vertical.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vertical: slug } = await params;
  const vertical = getVertical(slug);
  if (!vertical) return {};
  return pageMetadata({
    title: vertical.metaTitle,
    description: vertical.metaDescription,
    path: `/${vertical.slug}`,
  });
}

export default async function VerticalPage({ params }: Props) {
  const { vertical: slug } = await params;
  const vertical = getVertical(slug);
  if (!vertical) notFound();
  const portfolioVideos = fullPortfolio
    .filter((video) => video.category === vertical.portfolioCategory)
    .slice(0, vertical.portfolioLimit);

  return (
    <>
      {vertical.serviceSchema ? (
        <JsonLd
          data={pageServiceSchema({
            name: vertical.name,
            description: vertical.metaDescription,
            path: `/${vertical.slug}`,
            serviceType: vertical.serviceType,
          })}
        />
      ) : null}
      {vertical.videoSchema
        ? videoObjectsSchema(portfolioVideos).map((data) => (
            <JsonLd key={data.embedUrl} data={data} />
          ))
        : null}
      <JsonLd data={faqSchema(vertical.faqs)} />
      <JsonLd data={breadcrumbSchema(vertical.name, `/${vertical.slug}`)} />
      <ServicePageTemplate
        heroLabel={vertical.heroLabel}
        title={vertical.title}
        description={vertical.description}
        primaryCta={vertical.primaryCta}
        primaryHref={vertical.primaryHref}
        secondaryCta={vertical.secondaryCta}
        secondaryHref={vertical.secondaryHref}
        sections={vertical.sections}
        pricingTitle={vertical.pricingTitle}
        pricingBody={vertical.pricingBody}
        pricingTable={vertical.pricingTable}
        sectionsAfterPricing={vertical.sectionsAfterPricing}
        faqs={vertical.faqs}
        portfolioTitle={vertical.portfolioTitle}
        portfolioDescription={vertical.portfolioDescription}
        portfolioVideos={portfolioVideos}
        formSection={
          vertical.form === "agency" ? (
            <section
              id="agency-form"
              className="rounded-[1.75rem] border-4 border-gray-800 bg-white px-6 py-7 shadow-[10px_10px_0_rgba(255,230,109,0.9)]"
            >
              <p className="mb-2 text-base font-bold uppercase tracking-[0.18em] text-[#FF3333]">
                Agency partner inquiry
              </p>
              <h2 className="font-display text-4xl font-bold text-gray-800">
                Tell us about your agency and support needs
              </h2>
              <p className="mt-3 text-lg leading-8 text-gray-600">
                Use this form if you are an agency exploring project-based or
                recurring white-label video support.
              </p>
              <div className="mt-6">
                <AgencyInquiryForm />
              </div>
            </section>
          ) : undefined
        }
        finalTitle={vertical.finalTitle}
        finalBody={vertical.finalBody}
        finalSecondary={vertical.finalSecondary}
        finalSecondaryHref={vertical.finalSecondaryHref}
        finalContact={vertical.finalContact}
        topDoodle={vertical.topDoodle}
        sideDoodle={vertical.sideDoodle}
      />
    </>
  );
}
