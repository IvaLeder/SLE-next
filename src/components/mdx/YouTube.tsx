"use client";

import { useState } from "react";

interface YouTubeProps {
  id: string;
}

export default function YouTube({ id }: YouTubeProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  return (
    <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg bg-black">
      {isPlaying ? (
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          onClick={() => setIsPlaying(true)}
          className="absolute inset-0 w-full h-full group"
        >
          <img
            src={thumbnail}
            alt="YouTube thumbnail"
            className="w-full h-full object-cover"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 group-hover:bg-white shadow-lg rounded-full flex items-center justify-center transition">
              <svg
                className="w-7 h-7 text-black ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
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