"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** A timestamp in the viewer's own time zone (UTC on the server render). */
export function LocalTime({ iso }: { iso: string }) {
  const label = useSyncExternalStore(
    subscribe,
    () =>
      new Date(iso).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    () =>
      new Date(iso).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }) + " UTC",
  );
  return <time dateTime={iso}>{label}</time>;
}
