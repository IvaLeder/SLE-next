"use client";

import { useState } from "react";
import Image from "next/image";
import videoMetadata from "@/lib/video-metadata.json";

const LABELS = {
  en: { play: (t: string) => `Play: ${t}`, thumb: (t: string) => `Thumbnail for: ${t}` },
  hr: { play: (t: string) => `Pokreni: ${t}`, thumb: (t: string) => `Sličica za: ${t}` },
} as const;

interface VideoMeta {
  title: string;
  description: string;
  uploadDate: string;
  duration: string | null;
}

const META = videoMetadata as Record<string, VideoMeta | undefined>;

// Google caps how much of a description it will use; a few hundred characters is
// plenty and keeps the inlined JSON small.
const DESCRIPTION_LIMIT = 500;

function truncate(text: string, limit: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  return clean.slice(0, clean.lastIndexOf(" ", limit) || limit).trimEnd() + "…";
}

/**
 * VideoObject for the embedded video. The WordPress site emitted this for every
 * embed and the migration dropped it, which zeroed out the GSC Videos report in
 * June 2026. `uploadDate` is required and only YouTube knows it, so we emit
 * nothing at all unless `scripts/fetch-video-metadata.mjs` has supplied it —
 * absent markup is far better than markup Google flags as invalid.
 */
function videoSchema(id: string, name: string) {
  const meta = META[id];
  if (!meta?.uploadDate) return null;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description: truncate(meta.description || name, DESCRIPTION_LIMIT),
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    uploadDate: meta.uploadDate,
    embedUrl: `https://www.youtube.com/embed/${id}`,
    ...(meta.duration ? { duration: meta.duration } : {}),
  };
}

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
  // Prefer the title the article author wrote: it is already in the page's language.
  const videoTitle = title || META[id]?.title || "YouTube video";
  const schema = videoSchema(id, videoTitle);

  return (
    <div className="not-prose relative w-full aspect-video overflow-hidden rounded-lg bg-black my-6">
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
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
