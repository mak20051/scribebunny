import Image from "next/image";
import Link from "next/link";
import {
  ADDRESS,
  CALENDLY_URL,
  EMAIL,
  PARENT_COMPANY,
  PHONE_DISPLAY,
  PHONE_HREF,
} from "@/lib/site";

const navItems = [
  { href: "/#services", label: "Services" },
  { href: "/work", label: "Our Work" },
  { href: "/#process", label: "Process" },
  { href: "/#pricing", label: "Pricing" },
];

function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/brand/scribebunny-logo-uploaded.png"
        alt="Scribebunny"
        width={small ? 170 : 220}
        height={small ? 48 : 62}
        priority={!small}
        className={small ? "h-auto w-[170px]" : "h-auto w-[220px]"}
      />
    </div>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="paper-texture fixed inset-0 pointer-events-none z-[9999]" />

      <header className="fixed top-0 z-50 w-full border-b-4 border-dashed border-gray-200 bg-white/80 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative font-bold text-gray-700 transition-colors hover:text-[#FF3333]"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-primary px-4 py-2 text-sm"
            >
              Book a Strategy Call
            </a>
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t-4 border-gray-800 bg-white pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 grid gap-12 md:grid-cols-4">
            <div>
              <Link href="/" className="mb-6 flex items-center gap-3">
                <Logo small />
              </Link>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">
                Strategy-led explainer, demo, onboarding, and white-label video
                production for SaaS brands, startups, and agencies.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-bold text-gray-800">Services</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link
                    href="/saas-explainer-videos"
                    className="hover:text-[#FF3333]"
                  >
                    SaaS Explainer Videos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/product-demo-onboarding-videos"
                    className="hover:text-[#FF3333]"
                  >
                    Product Demo Videos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/product-demo-onboarding-videos"
                    className="hover:text-[#FF3333]"
                  >
                    Onboarding Video Assets
                  </Link>
                </li>
                <li>
                  <Link
                    href="/white-label-video-production"
                    className="hover:text-[#FF3333]"
                  >
                    White-Label Production
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-bold text-gray-800">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/work" className="hover:text-[#FF3333]">
                    Our Work
                  </Link>
                </li>
                <li>
                  <Link href="/#process" className="hover:text-[#FF3333]">
                    Process
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-[#FF3333]">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-bold text-gray-800">Contact</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#FF3333]"
                  >
                    Book a Strategy Call
                  </a>
                </li>
                <li>
                  <a
                    href="/contact#contact-form"
                    className="hover:text-[#FF3333]"
                  >
                    Request a Quote
                  </a>
                </li>
                <li>
                  <Link
                    href="/white-label-video-production#agency-form"
                    className="hover:text-[#FF3333]"
                  >
                    Agency Partner Inquiries
                  </Link>
                </li>
                <li>{EMAIL}</li>
                <li>
                  <a href={PHONE_HREF} className="hover:text-[#FF3333]">
                    Hotline: {PHONE_DISPLAY}
                  </a>
                </li>
                <li>
                  <address className="not-italic">
                    {ADDRESS.street}
                    <br />
                    {ADDRESS.city}, {ADDRESS.region} {ADDRESS.postalCode}
                    <br />
                    {ADDRESS.country}
                  </address>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t-2 border-gray-200 pt-8 text-sm text-gray-500 md:flex-row">
            <p>
              © 2026 Scribebunny, a brand of {PARENT_COMPANY}. All rights
              reserved.
            </p>
            <div className="flex gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
