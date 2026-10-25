import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LocalTime } from "@/components/local-time";
import { PortalShell } from "@/components/portal-shell";
import { SubmitButton } from "@/components/submit-button";
import { replaceTeamKeyAction, sendTeamLinkAction } from "@/app/portal/actions";
import { memberForKey, teamMembers } from "@/lib/access";

export const metadata: Metadata = {
  title: "Team access | Scribebunny Studio",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ k?: string; done?: string; who?: string }>;
};

/** Owner only: who has a studio link, and replacing one person's link. */
export default async function TeamAccessPage({ searchParams }: Props) {
  const { k = "", done, who } = await searchParams;
  const owner = await memberForKey(k);
  if (!owner?.owner) {
    return (
      <PortalShell label="Studio">
        <p className="text-center text-lg text-gray-700">
          Team access is for the studio owner. Open it from your studio
          dashboard.
        </p>
      </PortalShell>
    );
  }
  const members = await teamMembers();

  return (
    <PortalShell label="Studio">
      <Link
        href={`/portal?k=${owner.key}`}
        className="inline-flex items-center gap-1 text-base font-bold text-[#FF3333] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Orders
      </Link>
      <h1 className="font-display mt-1 text-4xl font-bold text-gray-800">
        Team access
      </h1>
      <p className="mt-2 max-w-2xl text-lg text-gray-700">
        Everyone has their own private link, sent only in their own copy of each
        alert. Replacing someone&rsquo;s link stops their old links at once and
        emails them a new one; nobody else is affected. To add or remove
        someone, change the team list in the site settings.
      </p>
      {done && who ? (
        <p
          role="status"
          className="mt-6 rounded-2xl border-2 border-gray-800 bg-[#FFF9E0] px-5 py-3 text-base font-semibold text-gray-800"
        >
          {done === "replaced"
            ? `New link sent to ${who}. Their old links no longer work.`
            : `Link sent to ${who}.`}
        </p>
      ) : null}

      <ul className="mt-8 space-y-4">
        {members.map((member) => (
          <li
            key={member.email}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-[3px] border-gray-800 bg-white p-5"
          >
            <div>
              <p className="text-lg font-bold text-gray-800">
                {member.email}
                {member.email === owner.email ? " (you)" : ""}
              </p>
              <p className="text-base text-gray-600">
                {member.owner ? "Owner" : "Team"} · link made{" "}
                <LocalTime iso={member.createdAt} />
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <form action={sendTeamLinkAction}>
                <input type="hidden" name="k" value={owner.key} />
                <input type="hidden" name="email" value={member.email} />
                <SubmitButton pendingLabel="Sending…" className="btn-secondary">
                  Email their link
                </SubmitButton>
              </form>
              <form action={replaceTeamKeyAction}>
                <input type="hidden" name="k" value={owner.key} />
                <input type="hidden" name="email" value={member.email} />
                <SubmitButton pendingLabel="Replacing…" className="btn-primary">
                  Replace link
                </SubmitButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </PortalShell>
  );
}
