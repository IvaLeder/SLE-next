"use client";

import { useState } from "react";
import Image from "next/image";

interface YouTubeProps {
  id: string;
  title?: string;
}

export default function YouTube({ id, title }: YouTubeProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // hqdefault is 480×360 — enough for the lazy-loaded poster, far smaller than maxres
  const thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const videoTitle = title || "YouTube video";

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-black my-6">
      {isPlaying ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title={videoTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          aria-label={`Play: ${videoTitle}`}
          className="absolute inset-0 w-full h-full group"
        >
          <Image
            src={thumbnail}
            alt={`Thumbnail for: ${videoTitle}`}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            loading="lazy"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 group-hover:bg-white shadow-lg rounded-full flex items-center justify-center transition">
              <svg
                className="w-7 h-7 text-black ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
