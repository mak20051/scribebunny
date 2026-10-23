"use client";

import { useState } from "react";

const VIDEO_ID = "xE5jZE_rFrk";
const PREVIEW_SRC = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&modestbranding=1&rel=0`;
const MODAL_SRC = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`;

export function HeroVideo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block aspect-video w-full cursor-pointer overflow-hidden rounded-[1.5rem] border-4 border-gray-800 bg-gray-900 shadow-[12px_12px_0_rgba(45,55,72,0.2)]"
      >
        <iframe
          src={PREVIEW_SRC}
          className="absolute inset-0 h-full w-full"
          frameBorder="0"
          allow="autoplay; fullscreen"
          title="Scribebunny hero preview"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110">
          <div className="play-btn">
            <div className="play-icon" />
          </div>
        </div>
      </button>

      {open ? (
        <div className="video-modal active">
          <div className="video-container bg-white">
            <button className="close-modal" onClick={() => setOpen(false)}>
              ×
            </button>
            <iframe
              src={MODAL_SRC}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
              title="Scribebunny video modal"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
