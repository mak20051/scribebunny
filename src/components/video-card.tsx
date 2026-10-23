"use client";

import { useState } from "react";

export type Video = {
  id: string;
  title: string;
  category: string;
  summary: string;
};

export function VideoCard({
  video,
  priority = false,
}: {
  video: Video;
  priority?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const thumbnail = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`;
  const watchUrl = `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <>
      <article className="overflow-hidden rounded-[2rem] border border-amber-100 bg-white shadow-[0_18px_60px_-30px_rgba(223,106,61,0.45)]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative block aspect-video w-full overflow-hidden bg-[linear-gradient(145deg,_#23172d_0%,_#341c49_44%,_#ff7a59_140%)] text-left"
          aria-label={`Play ${video.title}`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80 transition duration-500 group-hover:scale-[1.03]"
            style={{ backgroundImage: `url(${thumbnail})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.1)_0%,rgba(17,24,39,0.18)_40%,rgba(15,23,42,0.78)_100%)]" />
          <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur sm:left-5 sm:top-5">
            {priority ? "Featured" : "Watch sample"}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#ffb060,_#ff7a59)] text-white shadow-lg shadow-orange-900/30 transition group-hover:scale-105">
              <svg
                width="18"
                height="20"
                viewBox="0 0 18 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 2.2C2 1.42 2.85 0.94 3.52 1.35L15.53 8.72C16.18 9.12 16.18 10.07 15.53 10.47L3.52 17.85C2.85 18.26 2 17.78 2 17V2.2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        </button>
        <div className="space-y-3 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
            {video.category}
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
            {video.title}
          </h3>
          <p className="text-sm leading-7 text-slate-600">{video.summary}</p>
        </div>
      </article>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/82 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur"
            >
              Close
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-[#1b1524] px-5 py-4 text-sm text-slate-300">
              <span>{video.title}</span>
              <a
                href={watchUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-orange-300"
              >
                Open on YouTube →
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
