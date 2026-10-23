"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const VIDEO_ID = "xE5jZE_rFrk";
const PREVIEW_SRC = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&modestbranding=1&rel=0`;
const MODAL_SRC = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`;

export function HeroVideo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Play the Scribebunny video"
        className="group relative block aspect-video w-full cursor-pointer overflow-hidden rounded-[1.5rem] border-4 border-gray-800 bg-gray-900 shadow-[12px_12px_0_rgba(45,55,72,0.2)]"
      >
        <iframe
          src={PREVIEW_SRC}
          className="pointer-events-none absolute inset-0 h-full w-full"
          frameBorder="0"
          allow="autoplay; fullscreen"
          tabIndex={-1}
          aria-hidden="true"
          title="Scribebunny hero preview"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110">
          <div className="play-btn">
            <div className="play-icon" />
          </div>
        </div>
      </button>

      {open
        ? createPortal(
            <div
              className="video-modal active"
              role="dialog"
              aria-modal="true"
              onClick={(event) => {
                if (event.target === event.currentTarget) setOpen(false);
              }}
            >
              <div className="video-container bg-black">
                <button
                  type="button"
                  className="close-modal"
                  aria-label="Close video"
                  onClick={() => setOpen(false)}
                >
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
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
