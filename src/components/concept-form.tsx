"use client";

import { PartyPopper } from "lucide-react";
import { useState } from "react";

type ConceptLead = {
  name: string;
  email: string;
  phone: string;
  website: string;
  details: string;
  company: string;
};

export function ConceptForm() {
  const [form, setForm] = useState<ConceptLead>({
    name: "",
    email: "",
    phone: "",
    website: "",
    details: "",
    company: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (field: keyof ConceptLead, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.website.trim() && !form.details.trim()) {
      setError("Add your website or a few lines about your business.");
      return;
    }
    setError("");
    setSending(true);
    try {
      const response = await fetch("/api/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (response.ok) {
        setSent(true);
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <PartyPopper
          className="h-16 w-16 text-[#FF3333]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <h3 className="font-display text-3xl font-bold text-gray-800">
          Your concepts are on our drawing board!
        </h3>
        <p className="max-w-md text-gray-700">
          We&apos;re researching your business now. Check your inbox: your 3
          concepts arrive within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          type="text"
          autoComplete="name"
          placeholder="Your name *"
          className="form-input"
          required
        />
        <input
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          type="email"
          autoComplete="email"
          placeholder="Business email *"
          className="form-input"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          type="tel"
          autoComplete="tel"
          placeholder="Phone *"
          className="form-input"
          required
        />
        <input
          value={form.website}
          onChange={(e) => update("website", e.target.value)}
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="Your website"
          className="form-input"
        />
      </div>
      <textarea
        value={form.details}
        onChange={(e) => update("details", e.target.value)}
        rows={4}
        placeholder="What should the video explain, and who is it for? (Required if you don't have a website)"
        className="form-input"
      />
      <input
        value={form.company}
        onChange={(e) => update("company", e.target.value)}
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      {error ? (
        <p className="text-base font-medium text-red-600">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={sending}
        className="btn-primary w-full text-lg disabled:opacity-60"
      >
        {sending ? "Sending…" : "Get My 3 Free Concepts"}
      </button>
      <p className="text-center text-sm text-gray-600">
        Free · No commitment · In your inbox within 24 hours
      </p>
    </form>
  );
}
