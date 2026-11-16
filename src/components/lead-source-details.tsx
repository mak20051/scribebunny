import { sourceFields, type LeadSource } from "@/lib/lead-source";

/** Studio view: where a lead or buyer came from (lib/lead-source.ts). */
export function LeadSourceDetails({
  source,
  className = "",
}: {
  source?: LeadSource;
  className?: string;
}) {
  const rows = sourceFields(source).filter(([, value]) => value);
  return (
    <div
      className={`rounded-xl border-2 border-dashed border-gray-300 p-4 text-base text-gray-700 ${className}`}
    >
      <h2 className="font-bold text-gray-800">Where they came from</h2>
      {rows.length ? (
        <dl className="mt-2 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="inline font-bold">{label}: </dt>
              <dd className="inline break-words">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-1 text-gray-600">
          Not recorded (sent before source tracking started on Nov 16, 2026, or
          created by the team).
        </p>
      )}
    </div>
  );
}
