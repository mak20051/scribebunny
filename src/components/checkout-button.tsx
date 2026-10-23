"use client";

import { useState } from "react";
import type { VideoPackageId } from "@/lib/packages";

export function CheckoutButton({
  packageId,
  label = "Buy Now",
  className = "btn-primary w-full",
}: {
  packageId: VideoPackageId;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = (await response.json()) as { url?: string };
      if (response.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
    } catch {
      // Falls through to the error message below.
    }
    setLoading(false);
    setError("Checkout is not available right now. Please contact our team.");
  };

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={`${className} disabled:opacity-60`}
      >
        {loading ? "Opening checkout…" : label}
      </button>
      {error ? (
        <p className="mt-3 text-base font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
