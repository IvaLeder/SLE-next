"use client";

import { useState } from "react";
import Image from "next/image";

const LABELS = {
  en: { play: (t: string) => `Play: ${t}`, thumb: (t: string) => `Thumbnail for: ${t}` },
  hr: { play: (t: string) => `Pokreni: ${t}`, thumb: (t: string) => `Sličica za: ${t}` },
} as const;

interface YouTubeProps {
  id: string;
  title?: string;
  lang?: "en" | "hr";
}

export default function YouTube({ id, title, lang = "en" }: YouTubeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const t = LABELS[lang];

  // hqdefault is 480×360 — enough for the lazy-loaded poster, far smaller than maxres
  const thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const videoTitle = title || "YouTube video";

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-black my-6">
      {isPlaying ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          // nocookie domain — no tracking cookies until the user actually plays,
          // and even then YouTube uses its "privacy-enhanced mode" storage.
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={videoTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          aria-label={t.play(videoTitle)}
          className="absolute inset-0 w-full h-full group"
        >
          <Image
            src={thumbnail}
            alt={t.thumb(videoTitle)}
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
