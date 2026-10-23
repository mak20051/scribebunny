"use client";

import { useState } from "react";
import { VideoCard, type Video } from "@/components/video-card";

const ALL = "All";

export function PortfolioGallery({ videos }: { videos: Video[] }) {
  const categories = [ALL, ...new Set(videos.map((video) => video.category))];
  const [category, setCategory] = useState(ALL);
  const visible =
    category === ALL
      ? videos
      : videos.filter((video) => video.category === category);

  return (
    <>
      <div
        className="mb-8 flex flex-wrap justify-center gap-3"
        role="group"
        aria-label="Filter videos by category"
      >
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
            className={`filter-btn ${category === item ? "active" : ""}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((video, index) => (
          <VideoCard
            key={`${video.id}-${index}`}
            video={video}
            priority={index < 3}
          />
        ))}
      </div>
    </>
  );
}
