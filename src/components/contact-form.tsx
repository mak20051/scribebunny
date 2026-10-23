"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LeadForm = {
  name: string;
  email: string;
  phone: string;
  website: string;
  brief: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ContactForm({
  buttonLabel = "Send Message",
}: {
  buttonLabel?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<LeadForm>({
    name: "",
    email: "",
    phone: "",
    website: "",
    brief: "",
  });
  const update = (field: keyof LeadForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const submit = async () => {
    if (!isValidEmail(form.email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    setSending(true);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "strategy",
        subject: `Scribebunny lead from ${form.name || "Website visitor"}`,
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
    if (response.ok) {
      setSent(true);
      router.push("/thank-you");
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
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
      {emailError ? (
        <p className="text-base font-medium text-red-600">{emailError}</p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
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
        placeholder="Brief (optional)"
        rows={4}
        className="form-input"
      />
      <button
        disabled={sending}
        type="submit"
        className="btn-primary w-full text-lg disabled:opacity-60"
      >
        {sending ? "Sending..." : buttonLabel}
      </button>
      {sent ? (
        <p className="text-base font-semibold text-green-700">
          Thanks — your details were sent successfully.
        </p>
      ) : null}
    </form>
  );
}
