"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Lang = "en" | "hr";
type Activity = { slug: string; title: string; emoji: string };

const COPY = {
  en: {
    prompt: "Can't decide what to do? Spin for a surprise STEM activity!",
    spin: "🎲 Spin!",
    spinning: "Spinning…",
    again: "🎲 Spin again",
    doIt: "Let's do this one →",
    count: (n: number) => `Picking from ${n} activities`,
  },
  hr: {
    prompt: "Ne možete se odlučiti? Zavrtite za iznenađenje — nasumičnu STEM aktivnost!",
    spin: "🎲 Zavrti!",
    spinning: "Vrtim…",
    again: "🎲 Zavrti opet",
    doIt: "Idemo na ovu →",
    count: (n: number) => `Biram između ${n} aktivnosti`,
  },
} as const;

export default function SpinActivity({
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

  const pick = () => activities[Math.floor(Math.random() * activities.length)];

  function spin() {
    if (spinning || activities.length === 0) return;
    setSpinning(true);
    intervalRef.current = setInterval(() => setCurrent(pick()), 80);
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrent(pick());
      setSpinning(false);
    }, 1200);
  }

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 text-center font-sans shadow-sm">
      <div className="flex min-h-[9rem] flex-col items-center justify-center rounded-2xl bg-brand-soft px-4 py-6">
        {current ? (
          <>
            <div className="text-5xl" aria-hidden="true">{current.emoji}</div>
            <p className="mt-2 text-lg font-semibold leading-snug text-gray-900">{current.title}</p>
            {!spinning && (
              <Link
                href={`/${lang}/${current.slug}`}
                className="mt-3 inline-block text-sm font-semibold text-brand hover:text-brand-hover hover:underline"
              >
                {t.doIt}
              </Link>
            )}
          </>
        ) : (
          <p className="max-w-sm text-[15px] leading-relaxed text-gray-600">{t.prompt}</p>
        )}
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={spinning}
        className="mt-4 rounded-full bg-brand px-8 py-3 font-sans text-base font-semibold text-white transition-transform hover:bg-brand-hover hover:scale-[1.03] disabled:opacity-60"
      >
        {spinning ? t.spinning : current ? t.again : t.spin}
      </button>

      <p className="mt-3 text-xs text-gray-400">{t.count(activities.length)}</p>
    </div>
  );
}
