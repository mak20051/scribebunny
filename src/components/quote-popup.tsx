"use client";

import { PartyPopper, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type QuoteForm = {
  name: string;
  email: string;
  phone: string;
  website: string;
  brief: string;
};

export function QuotePopupButton({
  className = "btn-secondary text-lg",
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className={className} type="button">
        Request a Quote
      </button>
      {open &&
        createPortal(
          <QuotePopup onClose={() => setOpen(false)} />,
          document.body,
        )}
    </>
  );
}

function QuotePopup({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<QuoteForm>({
    name: "",
    email: "",
    phone: "",
    website: "",
    brief: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const update = (field: keyof QuoteForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(form.email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    setSending(true);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "quote",
        subject: `Quote request from ${form.name || "Website visitor"}`,
        fields: {
          Name: form.name,
          Email: form.email,
          Phone: form.phone,
          Website: form.website,
          Brief: form.brief,
        },
      }),
    });
    setSending(false);
    if (response.ok) setSent(true);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      onClick={(event) => {
        if (event.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg rounded-[1.75rem] border-4 border-gray-800 bg-white shadow-[12px_12px_0_rgba(255,230,109,0.9)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b-4 border-gray-800 bg-[#FFE66D] px-6 py-5 rounded-t-[1.4rem]">
          <div>
            <span className="inline-block rotate-[-1deg] rounded-full border-2 border-gray-800 bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#FF3333] mb-2">
              Free Consultation
            </span>
            <h2 className="font-display text-2xl font-bold text-gray-800 leading-tight">
              Request a Quote
            </h2>
            <p className="mt-1 text-base text-gray-700">
              Tell us about your project — we&apos;ll get back within 24 hours.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close"
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-gray-800 bg-white font-bold text-gray-800 transition hover:bg-[#FF3333] hover:text-white"
          >
            <X className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-6">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <PartyPopper
                className="h-16 w-16 text-[#FF3333]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <h3 className="font-display text-2xl font-bold text-gray-800">
                Quote request sent!
              </h3>
              <p className="text-gray-600">
                Thanks for reaching out. Our team will review your details and
                reply within 24 hours.
              </p>
              <button
                onClick={onClose}
                type="button"
                className="btn-primary mt-2"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  type="text"
                  placeholder="Name *"
                  className="form-input"
                  required
                />
                <input
                  value={form.email}
                  onChange={(e) => {
                    update("email", e.target.value);
                    setEmailError("");
                  }}
                  type="email"
                  placeholder="Email *"
                  className="form-input"
                  required
                />
              </div>
              {emailError && (
                <p className="text-base font-medium text-red-600">
                  {emailError}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  type="tel"
                  placeholder="Phone *"
                  className="form-input"
                  required
                />
                <input
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  type="text"
                  placeholder="Website (optional)"
                  className="form-input"
                />
              </div>
              <textarea
                value={form.brief}
                onChange={(e) => update("brief", e.target.value)}
                placeholder="Tell us about your project (optional)"
                rows={3}
                className="form-input"
              />
              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full text-lg disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send Quote Request"}
              </button>
              <p className="text-center text-sm text-gray-600">
                Free consultation • No commitment • Response within 24 hours
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
