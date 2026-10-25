import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { SubmitButton } from "@/components/submit-button";
import { createPortalAction } from "@/app/portal/actions";
import { memberForKey } from "@/lib/access";
import { PARENT_COMPANY } from "@/lib/site";

export const metadata: Metadata = {
  title: "New client portal | Scribebunny Studio",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ k?: string }> };

const label = "block text-base font-semibold text-gray-700";

/** Team: open a portal by hand for a client, with a custom price. */
export default async function NewPortalPage({ searchParams }: Props) {
  const { k = "" } = await searchParams;
  const member = await memberForKey(k);
  if (!member) {
    return (
      <PortalShell label="Studio">
        <p className="text-center text-lg text-gray-700">
          Open this from your studio dashboard.
        </p>
      </PortalShell>
    );
  }

  return (
    <PortalShell label="Studio">
      <Link
        href={`/portal?k=${member.key}`}
        className="inline-flex items-center gap-1 text-base font-bold text-[#FF3333] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Orders
      </Link>
      <h1 className="font-display mt-1 text-4xl font-bold text-gray-800">
        New client portal
      </h1>
      <p className="mt-2 max-w-2xl text-lg text-gray-700">
        For custom deals: set your own price and number of videos. The client
        gets their own private link, pays with Stripe in the portal (invoiced by{" "}
        {PARENT_COMPANY}) unless you mark it already paid, and gets every update
        by email like any other order.
      </p>

      <form
        action={createPortalAction}
        className="mt-8 max-w-3xl space-y-8 rounded-[1.75rem] border-4 border-gray-800 bg-white p-5 sm:p-8"
      >
        <input type="hidden" name="k" value={member.key} />

        <fieldset className="space-y-4">
          <legend className="font-display text-2xl font-bold text-gray-800">
            Client
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              Name
              <input
                name="name"
                required
                maxLength={120}
                autoComplete="off"
                className="form-input mt-1"
              />
            </label>
            <label className={label}>
              Email
              <input
                name="email"
                type="email"
                required
                maxLength={200}
                autoComplete="off"
                className="form-input mt-1"
              />
            </label>
            <label className={label}>
              Phone (optional)
              <input
                name="phone"
                type="tel"
                maxLength={40}
                autoComplete="off"
                className="form-input mt-1"
              />
            </label>
            <label className={label}>
              Company website (optional)
              <input
                name="website"
                maxLength={200}
                placeholder="example.com"
                autoComplete="off"
                className="form-input mt-1"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-2xl font-bold text-gray-800">
            Project
          </legend>
          <label className={label}>
            Project name
            <input
              name="projectName"
              required
              maxLength={120}
              defaultValue="Custom video package"
              className="form-input mt-1"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className={label}>
              Number of videos
              <input
                name="videos"
                type="number"
                required
                min={1}
                max={100}
                defaultValue={1}
                className="form-input mt-1"
              />
            </label>
            <label className={label}>
              Price (USD)
              <input
                name="price"
                required
                inputMode="decimal"
                pattern="\$?[0-9,]+(\.[0-9]{1,2})?"
                placeholder="1,500"
                className="form-input mt-1"
              />
            </label>
            <label className={label}>
              Delivery (optional)
              <input
                name="turnaround"
                maxLength={120}
                placeholder="Within 2 weeks"
                className="form-input mt-1"
              />
            </label>
          </div>
          <label className={label}>
            What should the videos explain? (optional)
            <textarea
              name="topic"
              rows={3}
              maxLength={2000}
              className="form-input mt-1"
            />
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-display text-2xl font-bold text-gray-800">
            Payment
          </legend>
          <label className="flex items-start gap-3 text-base text-gray-800">
            <input
              type="radio"
              name="payment"
              value="stripe"
              defaultChecked
              className="mt-1 h-5 w-5 accent-[#FF3333]"
            />
            <span>
              <strong>Client pays in the portal.</strong> Their portal shows a
              Pay button for this price; Stripe takes the card and{" "}
              {PARENT_COMPANY} sends the invoice.
            </span>
          </label>
          <label className="flex items-start gap-3 text-base text-gray-800">
            <input
              type="radio"
              name="payment"
              value="paid"
              className="mt-1 h-5 w-5 accent-[#FF3333]"
            />
            <span>
              <strong>Already paid</strong> another way (bank transfer, your own
              invoice).
            </span>
          </label>
        </fieldset>

        <label className="flex items-start gap-3 text-base text-gray-800">
          <input
            type="checkbox"
            name="welcome"
            defaultChecked
            className="mt-1 h-5 w-5 accent-[#FF3333]"
          />
          <span>
            Email the client their portal link now, with the project details{" "}
            (and the Pay button if they still need to pay).
          </span>
        </label>

        <SubmitButton
          pendingLabel="Creating…"
          className="btn-primary w-full sm:w-auto"
        >
          Create client portal
        </SubmitButton>
      </form>
    </PortalShell>
  );
}
