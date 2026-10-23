import { CALENDLY_URL } from "@/lib/site";

export type Faq = {
  question: string;
  answer: string;
};

export function MarketingHero({
  label,
  title,
  description,
  primaryCta,
  secondaryCta,
  primaryHref = CALENDLY_URL,
  secondaryHref = "#",
}: {
  label: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  primaryHref?: string;
  secondaryHref?: string;
}) {
  const external = primaryHref.startsWith("http");

  return (
    <section className="relative z-10 overflow-hidden px-6 pt-32 pb-18 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl text-center">
        <span className="mb-4 inline-block rotate-[-2deg] rounded-full border-2 border-gray-800 bg-[#FFE66D] px-4 py-2 text-sm font-bold">
          {label}
        </span>
        <h1 className="font-display text-5xl font-bold leading-tight text-gray-800 md:text-7xl">
          {title}
        </h1>
        <p className="font-handwritten mx-auto mt-6 max-w-3xl text-2xl text-gray-600">
          {description}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={primaryHref}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            className="btn-primary text-lg"
          >
            {primaryCta}
          </a>
          <a href={secondaryHref} className="btn-secondary text-lg">
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}

export function MarketingSection({
  label,
  title,
  description,
  children,
}: {
  label?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative z-10 py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mb-14 text-center">
          {label ? (
            <span className="mb-4 inline-block rotate-[1deg] rounded-full border-2 border-gray-800 bg-[#FF6B6B] px-4 py-2 text-sm font-bold text-white">
              {label}
            </span>
          ) : null}
          <h2 className="font-display text-5xl font-bold text-gray-800">
            {title}
          </h2>
          {description ? (
            <p className="font-handwritten mx-auto mt-4 max-w-3xl text-lg text-gray-600">
              {description}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function BulletGrid({ items }: { items: string[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item} className="service-card p-6">
          <div className="mb-3 text-2xl text-[#FF3333]">✓</div>
          <p className="font-semibold text-gray-700">{item}</p>
        </div>
      ))}
    </div>
  );
}

export function SimpleFaq({ items }: { items: Faq[] }) {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {items.map((item) => (
        <article key={item.question} className="testimonial-card">
          <h3 className="text-xl font-bold text-gray-800">{item.question}</h3>
          <p className="mt-4 text-gray-600">{item.answer}</p>
        </article>
      ))}
    </div>
  );
}

export function FinalCta({
  title,
  description,
  primary,
  secondary,
  secondaryHref,
}: {
  title: string;
  description: string;
  primary: string;
  secondary: string;
  secondaryHref?: string;
}) {
  return (
    <section
      id="contact-cta"
      className="relative z-10 overflow-hidden bg-[#FFE66D] py-20"
    >
      <div className="absolute top-10 left-10 text-6xl opacity-20">✏️</div>
      <div className="absolute right-10 bottom-10 text-6xl opacity-20">🎨</div>
      <div className="absolute top-1/2 right-20 text-5xl opacity-20">✨</div>
      <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-8">
        <h2 className="font-display text-5xl font-bold text-gray-800 md:text-6xl">
          {title}
        </h2>
        <p className="font-handwritten mx-auto mt-6 max-w-3xl text-xl text-gray-700">
          {description}
        </p>
        <div className="mb-6 mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-primary border-gray-800 bg-gray-800 shadow-gray-600"
          >
            {primary}
          </a>
          <a
            href={secondaryHref || "/contact#contact-form"}
            className="btn-secondary bg-white"
          >
            {secondary}
          </a>
        </div>
        <p className="font-bold text-gray-700">
          Free consultation • No commitment • Response within 24 hours
        </p>
      </div>
    </section>
  );
}

export function PageDivider() {
  return <div className="section-divider" />;
}
