"use client";

import { Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CALENDLY_URL, PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

export function MobileNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-xl border-[3px] border-gray-800 bg-white text-xl font-bold text-gray-800 shadow-[3px_3px_0_#2D3748]"
      >
        {open ? (
          <X className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
        )}
      </button>

      {open ? (
        <nav
          id="mobile-menu"
          className="absolute inset-x-0 top-full border-b-4 border-dashed border-gray-200 bg-white px-6 pt-4 pb-6 shadow-lg"
        >
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="block rounded-lg px-2 py-3 text-lg font-bold text-gray-700 hover:text-[#FF3333]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                onClick={close}
                className="block rounded-lg px-2 py-3 text-lg font-bold text-gray-700 hover:text-[#FF3333]"
              >
                Contact
              </Link>
            </li>
          </ul>
          <a
            href={PHONE_HREF}
            className="mt-3 flex items-center gap-2 px-2 font-bold text-gray-700"
          >
            <Phone className="h-5 w-5 text-[#FF3333]" aria-hidden="true" />
            Hotline: {PHONE_DISPLAY}
          </a>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            onClick={close}
            className="btn-primary mt-5 block w-full text-center"
          >
            Book a Strategy Call
          </a>
        </nav>
      ) : null}
    </div>
  );
}
