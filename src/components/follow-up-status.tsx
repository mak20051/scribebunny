import { LocalTime } from "@/components/local-time";
import { SubmitButton } from "@/components/submit-button";
import type {
  ProspectFollowUps,
  ScheduleRow,
} from "@/lib/prospect-follow-ups";

const STATE: Record<ScheduleRow["state"], string> = {
  sent: "Sent",
  due: "Goes out after",
  skipped: "Skipped (too late to send)",
  off: "Off",
};

/** The team's view of a prospect's reminders, with a Stop button while any are left. */
export function FollowUpStatus({
  title,
  rows,
  stopped,
  ordered,
  action,
  hidden,
  className = "",
}: {
  title: string;
  rows: ScheduleRow[];
  stopped?: ProspectFollowUps["stopped"];
  /** The prospect became a client (their project ref): no reminders needed. */
  ordered?: string | null;
  action: (formData: FormData) => Promise<void>;
  hidden: React.ReactNode;
  className?: string;
}) {
  const active =
    !stopped && !ordered && rows.some((row) => row.state === "due");
  return (
    <section
      className={`rounded-2xl border-2 border-gray-800 bg-white p-5 text-base text-gray-700 ${className}`}
    >
      <h2 className="font-display text-2xl font-bold text-gray-800">{title}</h2>
      <ul className="mt-3 space-y-1">
        {rows.map((row) => {
          const notNeeded = Boolean(ordered) && row.state === "due";
          return (
            <li key={row.label}>
              <span className="font-bold">{row.label}:</span>{" "}
              {notNeeded ? "Not needed" : STATE[row.state]}
              {row.at && !notNeeded ? (
                <>
                  {" "}
                  <LocalTime iso={row.at} />
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
      {ordered ? (
        <p className="mt-3">
          They placed an order ({ordered}), so no reminders go out.
        </p>
      ) : null}
      {stopped ? (
        <p className="mt-3">
          Stopped{" "}
          {stopped.by === "prospect"
            ? "by the prospect"
            : `by ${stopped.email ?? "the team"}`}{" "}
          on <LocalTime iso={stopped.at} />.
        </p>
      ) : null}
      {active ? (
        <form
          action={action}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          {hidden}
          <SubmitButton
            pendingLabel="Stopping…"
            className="btn-secondary w-full sm:w-auto"
          >
            Stop follow-ups
          </SubmitButton>
          <p className="text-sm text-gray-600">
            Stop them once they reply or book a call: the site can&apos;t see
            either.
          </p>
        </form>
      ) : null}
    </section>
  );
}
