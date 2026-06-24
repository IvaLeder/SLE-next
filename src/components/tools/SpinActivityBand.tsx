"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Lang = "en" | "hr";
type Activity = { slug: string; title: string; emoji: string };

const COPY = {
  en: {
    prompt: "Can't decide what to do today?",
    spin: "Spin for an activity",
    spinning: "Spinning…",
    again: "Spin again",
    doIt: "Let's go →",
    label: "Your activity",
  },
  hr: {
    prompt: "Ne možete se odlučiti što danas raditi?",
    spin: "Zavrti aktivnost",
    spinning: "Vrtim…",
    again: "Zavrti opet",
    doIt: "Idemo →",
    label: "Vaša aktivnost",
  },
} as const;

/**
 * Slim homepage version of the activity spinner — a single colourful band that
 * sits between the hero and the article grid. The full card lives on the tool
 * page (<SpinActivity>). `activities` is fetched server-side and passed in.
 */
export default function SpinActivityBand({
  lang = "en",
  activities,
}: {
  lang?: Lang;
  activities: Activity[];
}) {
  const t = COPY[lang];
  const [current, setCurrent] = useState<Activity | null>(null);
  const [spinning, setSpinning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  function spin() {
    if (spinning || activities.length === 0) return;
    const pick = () => activities[Math.floor(Math.random() * activities.length)];
    setSpinning(true);
    intervalRef.current = setInterval(() => setCurrent(pick()), 80);
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrent(pick());
      setSpinning(false);
    }, 1200);
  }

  if (activities.length === 0) return null;

  return (
    <section
      className="mb-8 overflow-hidden rounded-2xl px-5 py-4 sm:px-6 sm:py-5"
      style={{ background: "linear-gradient(135deg, #FB6F52 0%, #F25C7A 60%, #8E54B5 100%)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex items-center gap-3 text-white">
          <span className="text-3xl" aria-hidden="true">{current ? current.emoji : "🎲"}</span>
          <div>
            {current ? (
              <>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#FFE3D6" }}>
                  {t.label}
                </p>
                <p className="font-sans text-lg font-semibold leading-snug">{current.title}</p>
              </>
            ) : (
              <p className="font-sans text-lg font-semibold">{t.prompt}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {current && !spinning && (
            <Link
              href={`/${lang}/${current.slug}`}
              className="rounded-full bg-white/20 px-4 py-2 font-sans text-sm font-semibold text-white transition-colors hover:bg-white/30"
            >
              {t.doIt}
            </Link>
          )}
          <button
            type="button"
            onClick={spin}
            disabled={spinning}
            className="rounded-full bg-white px-5 py-2.5 font-sans text-sm font-semibold transition-transform hover:scale-[1.03] disabled:opacity-70"
            style={{ color: "#B23A1B" }}
          >
            🎲 {spinning ? t.spinning : current ? t.again : t.spin}
          </button>
        </div>
      </div>
    </section>
  );
}
