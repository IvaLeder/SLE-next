"use client";

import { useEffect, useRef, useState } from "react";

type Lang = "en" | "hr";

const COPY = {
  en: {
    start: "▶ Start",
    pause: "❚❚ Pause",
    resume: "▶ Resume",
    reset: "↺ Reset",
    done: "⏰ Time's up!",
  },
  hr: {
    start: "▶ Kreni",
    pause: "❚❚ Pauza",
    resume: "▶ Nastavi",
    reset: "↺ Ispočetka",
    done: "⏰ Vrijeme je isteklo!",
  },
} as const;

interface TimerProps {
  lang?: Lang;
  /** e.g. minutes="10" — MDX passes numbers as strings */
  minutes?: number | string;
  /** extra seconds, e.g. minutes="1" seconds="30" */
  seconds?: number | string;
  /** what the wait is for, e.g. "Let the egg soak" */
  label?: string;
}

/** Small end-of-countdown beep. Best-effort — silently skipped if blocked. */
function beep() {
  try {
    type AudioCtor = typeof AudioContext;
    const Ctor: AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: AudioCtor })
        .webkitAudioContext;
    const ctx = new Ctor();
    [0, 0.2, 0.4].forEach((at) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.12, ctx.currentTime + at);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + at + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + at);
      osc.stop(ctx.currentTime + at + 0.2);
    });
  } catch {
    /* no audio — fine */
  }
}

/**
 * Tap-to-start countdown for "now wait N minutes" steps:
 *
 *   <Timer minutes="10" label="Wait for the vinegar to work" />
 *
 * Wall-clock based (end timestamp, not tick counting) so it stays accurate
 * when the tab is backgrounded. Interactive-only, so hidden in print.
 */
export default function Timer({
  lang = "en",
  minutes,
  seconds,
  label,
}: TimerProps) {
  const t = COPY[lang];
  const total = Math.max(
    1,
    Math.round(Number(minutes ?? 0) * 60 + Number(seconds ?? 0))
  );

  const [remaining, setRemaining] = useState(total);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">(
    "idle"
  );
  const endAtRef = useRef(0);

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setStatus("done");
        beep();
      }
    }, 250);
    return () => clearInterval(id);
  }, [status]);

  const start = () => {
    endAtRef.current = Date.now() + remaining * 1000;
    setStatus("running");
  };
  const pause = () => setStatus("paused");
  const reset = () => {
    setRemaining(total);
    setStatus("idle");
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const progress = ((total - remaining) / total) * 100;

  return (
    <div
      data-no-print
      className="not-prose my-8 rounded-2xl border-2 border-brand-soft bg-white p-6 text-center font-sans"
    >
      {label && (
        <p className="mb-2 text-sm font-semibold text-gray-600">⏳ {label}</p>
      )}

      <p
        className={`text-5xl font-bold tabular-nums tracking-tight ${
          status === "done" ? "text-green-600" : "text-gray-900"
        }`}
      >
        {mm}:{ss}
      </p>

      <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p aria-live="polite" className="mt-2 h-5 text-sm font-medium text-green-700">
        {status === "done" ? t.done : ""}
      </p>

      <div className="mt-1 flex justify-center gap-2">
        {(status === "idle" || status === "paused") && (
          <button
            type="button"
            onClick={start}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            {status === "paused" ? t.resume : t.start}
          </button>
        )}
        {status === "running" && (
          <button
            type="button"
            onClick={pause}
            className="rounded-full bg-gray-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            {t.pause}
          </button>
        )}
        {status !== "idle" && (
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            {t.reset}
          </button>
        )}
      </div>
    </div>
  );
}
