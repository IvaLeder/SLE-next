"use client";

import Link from "next/link";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";

type Lang = "en" | "hr";

/** One door, already resolved on the server: `href` is null when the linked
 *  article isn't published (yet), so the door still works without a link. */
export type AdventDoorView = {
  day: number;
  icon: string;
  title: string;
  how: string;
  time: string;
  age: string;
  href: string | null;
};

const COPY = {
  en: {
    label: "Advent calendar, 24 doors",
    day: "Day",
    ages: "Ages",
    today: "Today",
    open: "Full instructions and the science →",
    markDone: "Mark as done",
    done: "Done! ✓",
    progress: (n: number) => `${n} of 24 doors done`,
    reset: "Start again",
    before: "The doors open on 1 December, but you can peek behind any of them now to plan ahead and gather materials.",
    after: "All 24 doors are open. Merry Christmas! Any experiment you missed is still waiting behind its door.",
    pick: "Tap a door to open it.",
  },
  hr: {
    label: "Adventski kalendar, 24 vrata",
    day: "Dan",
    ages: "Dob",
    today: "Danas",
    open: "Cijele upute i znanost →",
    markDone: "Označi kao gotovo",
    done: "Gotovo! ✓",
    progress: (n: number) => `${n} od 24 vrata gotovo`,
    reset: "Kreni ispočetka",
    before: "Vrata se otvaraju 1. prosinca, ali već sada možete zaviriti iza bilo kojih i na vrijeme pripremiti materijale.",
    after: "Svih 24 vrata je otvoreno. Sretan Božić! Svaki pokus koji ste propustili i dalje čeka iza svojih vrata.",
    pick: "Dodirnite vrata da ih otvorite.",
  },
} as const;

/** Doors are hung in a fixed jumbled order, like a paper calendar, so
 *  finding today's number is part of the fun. */
const ORDER = [7, 15, 2, 20, 11, 24, 4, 18, 9, 1, 13, 22, 16, 5, 21, 12, 3, 17, 23, 8, 14, 6, 19, 10];

const DOOR_COLORS = ["#14532D", "#9F1F35", "#0F3B2E", "#B4233C", "#1F6B45", "#7A1A2C"];

/** 0 = before December, 1-24 = today's door, 25 = after Christmas Eve.
 *  Client-only (the server snapshot is null), so SSR and hydration match. */
function currentDay(): number {
  const now = new Date();
  if (now.getMonth() !== 11) return 0;
  return Math.min(now.getDate(), 25);
}

const noopSubscribe = () => () => {};

/* Ticked doors live in localStorage, read as an external store so the first
 * client render matches SSR. Wrapped in try/catch: storage can be blocked. */
const STORAGE_KEY = "advent-calendar-2026";
const UPDATE_EVENT = "advent-calendar-updated";

function readDone(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function writeDone(days: number[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
  } catch {
    /* storage unavailable: ticks just won't persist */
  }
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

function subscribeDone(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(UPDATE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(UPDATE_EVENT, cb);
  };
}

function parseDone(raw: string | null): Set<number> {
  if (!raw) return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === "number") : []);
  } catch {
    return new Set();
  }
}

export default function AdventCalendar({ lang, doors }: { lang: Lang; doors: AdventDoorView[] }) {
  const c = COPY[lang];
  const today = useSyncExternalStore(noopSubscribe, currentDay, () => null);
  const doneRaw = useSyncExternalStore(subscribeDone, readDone, () => null);
  const done = parseDone(doneRaw);
  const [picked, setPicked] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const byDay = new Map(doors.map((d) => [d.day, d]));
  // Until a door is tapped, December shows today's door.
  const selectedDay = picked ?? (today && today >= 1 && today <= 24 ? today : null);
  const selected = selectedDay ? byDay.get(selectedDay) : undefined;

  const pick = useCallback((day: number) => {
    setPicked(day);
    // On phones the panel sits below the grid: bring it into view.
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }, []);

  const toggleDone = (day: number) => {
    const next = new Set(done);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    writeDone([...next].sort((a, b) => a - b));
  };

  const status = today === 0 ? c.before : today === 25 ? c.after : null;

  return (
    <div>
      <div role="group" aria-label={c.label} className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 sm:gap-3">
        {ORDER.map((day, index) => {
          const door = byDay.get(day);
          if (!door) return null;
          const isToday = today === day;
          const isDone = done.has(day);
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => pick(day)}
              aria-pressed={isSelected}
              aria-label={`${c.day} ${day}: ${door.title}${isDone ? ` (${c.done})` : ""}`}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl font-sans transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E9B949] ${
                isSelected ? "ring-4 ring-[#E9B949]" : ""
              } ${isToday && !isSelected ? "motion-safe:animate-pulse ring-2 ring-[#E9B949]" : ""}`}
              style={
                isDone
                  ? { background: "#FBF7EE", color: "#14532D", boxShadow: "inset 0 0 0 2px #D9CDB4" }
                  : { background: DOOR_COLORS[index % DOOR_COLORS.length], color: "#FFFFFF" }
              }
            >
              <span className="text-2xl font-bold leading-none sm:text-3xl">{day}</span>
              <span className="mt-1 text-lg leading-none sm:text-xl" aria-hidden="true">
                {isDone ? "✓" : door.icon}
              </span>
              {isToday && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-[#E9B949] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0B2E24]">
                  {c.today}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div ref={panelRef} className="mt-5 scroll-mt-24" aria-live="polite">
        {selected ? (
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-sm font-semibold text-[#9F1F35]">
              <span>
                {c.day} {selected.day}
              </span>
              <span className="text-gray-300" aria-hidden="true">·</span>
              <span className="text-gray-600">⏱ {selected.time}</span>
              <span className="text-gray-300" aria-hidden="true">·</span>
              <span className="text-gray-600">
                {c.ages} {selected.age}
              </span>
            </div>
            <h3 className="mt-2 flex items-center gap-3 text-2xl font-bold text-gray-900">
              <span className="text-3xl" aria-hidden="true">{selected.icon}</span>
              {selected.title}
            </h3>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-gray-700">{selected.how}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {selected.href && (
                <Link
                  href={selected.href}
                  className="rounded-full bg-[#14532D] px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-[#0F3B2E]"
                >
                  {c.open}
                </Link>
              )}
              <button
                type="button"
                onClick={() => toggleDone(selected.day)}
                aria-pressed={done.has(selected.day)}
                className={`rounded-full px-5 py-2.5 font-sans text-sm font-semibold transition ${
                  done.has(selected.day)
                    ? "bg-[#E9B949] text-[#0B2E24]"
                    : "border border-[#14532D]/30 text-[#14532D] hover:bg-[#14532D]/5"
                }`}
              >
                {done.has(selected.day) ? c.done : c.markDone}
              </button>
            </div>
          </div>
        ) : (
          <p className="rounded-3xl bg-[#FBF7EE] px-6 py-5 text-[16px] leading-relaxed text-gray-700">
            {status ?? c.pick} {status && c.pick}
          </p>
        )}
        {done.size > 0 && (
          <div className="mt-3 flex items-center justify-between gap-3 px-1 font-sans text-sm text-gray-500">
            <span>{c.progress(done.size)}</span>
            <button type="button" onClick={() => writeDone([])} className="underline decoration-dotted underline-offset-4 hover:text-gray-700">
              {c.reset}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
