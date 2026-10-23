import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EMAIL, PARENT_COMPANY, PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

/** A quiet frame for the client portal: logo, no marketing navigation. */
export function PortalShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#FFF5F5_0%,#FFFFFF_50%,#FFF9F0_100%)]">
      <header className="border-b-4 border-dashed border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/">
            <Image
              src="/brand/scribebunny-logo-uploaded.png"
              alt="Scribebunny"
              width={180}
              height={50}
              priority
              className="h-auto w-[140px] sm:w-[180px]"
            />
          </Link>
          <span className="rounded-full border-2 border-gray-800 bg-[#FFE66D] px-3 py-1 text-sm font-bold whitespace-nowrap text-gray-800 sm:px-4 sm:text-base">
            {label}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
      <footer className="border-t-2 border-gray-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-center text-base text-gray-600 sm:px-6 md:flex-row md:text-left">
          <p>Scribebunny is a brand of {PARENT_COMPANY}.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2 hover:text-[#FF3333]"
            >
              <Mail className="h-5 w-5 text-[#FF3333]" aria-hidden="true" />
              {EMAIL}
            </a>
            <a
              href={PHONE_HREF}
              className="flex items-center gap-2 hover:text-[#FF3333]"
            >
              <Phone className="h-5 w-5 text-[#FF3333]" aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
