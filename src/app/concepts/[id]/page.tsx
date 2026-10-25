import type { Metadata } from "next";
import { ExternalLink, RefreshCw, Send } from "lucide-react";
import {
  redraftConceptsAction,
  saveConceptsAction,
  sendConceptsAction,
} from "@/app/concepts/actions";
import { AutoRefresh } from "@/components/auto-refresh";
import { memberForKey } from "@/lib/access";
import { LocalTime } from "@/components/local-time";
import { PortalShell } from "@/components/portal-shell";
import { SubmitButton } from "@/components/submit-button";
import {
  CONCEPT_STYLES,
  getConceptRequest,
  type Concept,
  type ConceptStatus,
} from "@/lib/concepts";

export const metadata: Metadata = {
  title: "Concept Review | Scribebunny Studio",
  robots: { index: false, follow: false },
};

// Drafting again (website research + DeepSeek) runs inside the action.
export const maxDuration = 120;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ k?: string }>;
};

const STATUS: Record<ConceptStatus, { label: string; style: string }> = {
  drafting: { label: "Drafting…", style: "bg-[#FFE66D] text-gray-800" },
  review: { label: "Ready to review", style: "bg-[#4ECDC4] text-gray-800" },
  sent: { label: "Sent", style: "bg-green-600 text-white" },
  failed: { label: "Needs writing", style: "bg-[#FF6B6B] text-white" },
};

const EMPTY: Concept = {
  title: "",
  style: "2D animation",
  hook: "",
  story: [],
  visuals: "",
  whyItFits: "",
};

function Hidden({ id, k }: { id: string; k: string }) {
  return (
    <>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="k" value={k} />
    </>
  );
}

export default async function ConceptReviewPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { k = "" } = await searchParams;
  const request = (await memberForKey(k)) ? await getConceptRequest(id) : null;

  if (!request) {
    return (
      <PortalShell label="Studio">
        <p className="text-center text-lg text-gray-700">
          Open this page from the review link in a concept request email.
        </p>
      </PortalShell>
    );
  }

  const status = STATUS[request.status];
  const concepts = [0, 1, 2].map((index) => request.concepts[index] ?? EMPTY);

  return (
    <PortalShell label="Studio">
      {request.status === "drafting" ? <AutoRefresh seconds={10} /> : null}

      <section className="rounded-[1.75rem] border-4 border-gray-800 bg-white p-5 shadow-[6px_6px_0_#FFE66D] sm:p-8 sm:shadow-[10px_10px_0_#FFE66D]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-widest text-[#FF3333] uppercase">
              Free concepts · {request.id}
            </p>
            <h1 className="font-display mt-2 text-3xl leading-tight font-bold text-gray-800 sm:text-4xl">
              {request.lead.name}
            </h1>
          </div>
          <span
            className={`rounded-full border-2 border-gray-800 px-4 py-1 text-base font-bold ${status.style}`}
          >
            {status.label}
          </span>
        </div>
        <dl className="mt-6 grid gap-x-8 gap-y-2 text-base text-gray-700 sm:grid-cols-2">
          <div>
            <dt className="inline font-bold">Email: </dt>
            <dd className="inline">
              <a
                href={`mailto:${request.lead.email}`}
                className="text-[#FF3333] underline"
              >
                {request.lead.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="inline font-bold">Phone: </dt>
            <dd className="inline">{request.lead.phone}</dd>
          </div>
          {request.lead.website ? (
            <div>
              <dt className="inline font-bold">Website: </dt>
              <dd className="inline">{request.lead.website}</dd>
            </div>
          ) : null}
          <div>
            <dt className="inline font-bold">Asked: </dt>
            <dd className="inline">
              <LocalTime iso={request.createdAt} />
            </dd>
          </div>
          {request.sentAt ? (
            <div>
              <dt className="inline font-bold">Sent: </dt>
              <dd className="inline">
                <LocalTime iso={request.sentAt} />
              </dd>
            </div>
          ) : null}
        </dl>
        {request.lead.details ? (
          <p className="mt-4 rounded-xl bg-[#FFF9E0] p-4 whitespace-pre-wrap text-gray-800">
            {request.lead.details}
          </p>
        ) : null}
        {request.research ? (
          <p className="mt-4 flex items-start gap-2 text-base text-gray-700">
            <ExternalLink
              className="mt-1 h-5 w-5 shrink-0 text-[#FF3333]"
              aria-hidden="true"
            />
            <span>
              Researched{" "}
              <a
                href={request.research.url}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#FF3333] underline"
              >
                {request.research.title || request.research.url}
              </a>
              {request.research.description
                ? `: ${request.research.description}`
                : null}
            </span>
          </p>
        ) : null}
        {request.note ? (
          <p className="mt-4 rounded-xl border-2 border-dashed border-[#FF6B6B] p-4 text-gray-800">
            {request.note}
          </p>
        ) : null}
        {request.status === "drafting" ? (
          <p className="mt-4 text-gray-700">
            Researching the website and drafting with DeepSeek. This page
            refreshes on its own.
          </p>
        ) : null}
      </section>

      <form
        // Remount when a new draft arrives so the fields show it.
        key={request.concepts.map((concept) => concept.title).join("|")}
        action={saveConceptsAction}
        className="mt-10 space-y-8"
      >
        <Hidden id={request.id} k={k} />
        {concepts.map((concept, index) => (
          <fieldset key={index} className="service-card space-y-3">
            <legend className="font-display px-2 text-2xl font-bold text-gray-800">
              Concept {index + 1}
            </legend>
            <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
              <label className="block text-base font-semibold text-gray-700">
                Title
                <input
                  name={`title-${index}`}
                  defaultValue={concept.title}
                  className="form-input mt-1"
                />
              </label>
              <label className="block text-base font-semibold text-gray-700">
                Style
                <select
                  name={`style-${index}`}
                  defaultValue={concept.style}
                  className="form-input mt-1"
                >
                  {CONCEPT_STYLES.map((style) => (
                    <option key={style}>{style}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-base font-semibold text-gray-700">
              Hook (the opening line)
              <input
                name={`hook-${index}`}
                defaultValue={concept.hook}
                className="form-input mt-1"
              />
            </label>
            <label className="block text-base font-semibold text-gray-700">
              Story (one beat per line)
              <textarea
                name={`story-${index}`}
                defaultValue={concept.story.join("\n")}
                rows={5}
                className="form-input mt-1"
              />
            </label>
            <label className="block text-base font-semibold text-gray-700">
              The look
              <textarea
                name={`visuals-${index}`}
                defaultValue={concept.visuals}
                rows={2}
                className="form-input mt-1"
              />
            </label>
            <label className="block text-base font-semibold text-gray-700">
              Why it fits them
              <textarea
                name={`why-${index}`}
                defaultValue={concept.whyItFits}
                rows={2}
                className="form-input mt-1"
              />
            </label>
          </fieldset>
        ))}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <SubmitButton className="btn-secondary w-full sm:w-auto">
            Save changes
          </SubmitButton>
          <SubmitButton
            formAction={sendConceptsAction}
            pendingLabel="Sending…"
            className="btn-primary w-full sm:w-auto"
          >
            <span className="inline-flex items-center gap-2">
              <Send className="h-5 w-5" aria-hidden="true" />
              {request.status === "sent"
                ? `Send again to ${request.lead.name.split(" ")[0]}`
                : `Send to ${request.lead.name.split(" ")[0]}`}
            </span>
          </SubmitButton>
        </div>
      </form>

      <form
        action={redraftConceptsAction}
        className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t-2 border-dashed border-gray-200 pt-6"
      >
        <Hidden id={request.id} k={k} />
        <p className="text-base text-gray-600">
          Want fresh ideas? Drafting again replaces the concepts above.
        </p>
        <SubmitButton
          pendingLabel="Drafting… (up to a minute)"
          className="btn-secondary w-full sm:w-auto"
        >
          <span className="inline-flex items-center gap-2">
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
            Draft again
          </span>
        </SubmitButton>
      </form>
    </PortalShell>
  );
}
