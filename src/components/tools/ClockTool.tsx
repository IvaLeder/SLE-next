"use client";

import { useRef, useState } from "react";

type Lang = "en" | "hr";

const COPY = {
  en: {
    reads: "The clock reads",
    dragHint: "Grab a hand and drag it or use the buttons below.",
    practiceHint:
      "Move the hands, then say the time out loud. Tap “Show the time” to check!",
    hourHand: "hour hand (short)",
    minuteHand: "minute hand (long)",
    hourMinus: "−1 hour",
    hourPlus: "+1 hour",
    minMinus: "−5 min",
    minPlus: "+5 min",
    random: "🎲 Random time",
    hide: "🙈 Hide the time (practice)",
    show: "Show the time",
    clockLabel: "Analog clock showing",
    period: "Time of day",
    morning: "🌅 Morning",
    afternoon: "🌇 Afternoon",
  },
  hr: {
    reads: "Sat pokazuje",
    dragHint: "Uhvatite kazaljku i povucite je ili koristite gumbe ispod.",
    practiceHint:
      "Pomaknite kazaljke, pa naglas izgovorite vrijeme. Pritisnite “Pokaži vrijeme” za provjeru!",
    hourHand: "satna kazaljka (kratka)",
    minuteHand: "minutna kazaljka (duga)",
    hourMinus: "−1 sat",
    hourPlus: "+1 sat",
    minMinus: "−5 min",
    minPlus: "+5 min",
    random: "🎲 Nasumično vrijeme",
    hide: "🙈 Sakrij vrijeme (vježba)",
    show: "Pokaži vrijeme",
    clockLabel: "Analogni sat pokazuje",
    period: "Doba dana",
    morning: "🌅 Prijepodne",
    afternoon: "🌇 Poslijepodne",
  },
} as const;

const HOUR_COLOR = "#334155"; // slate — short hand
const MIN_COLOR = "#FB6F52"; // brand coral — long hand

const CX = 120;
const CY = 120;

/** Point on a circle: 0° = 12 o'clock, growing clockwise. Coordinates are
 *  rounded so tiny Math.sin/cos precision differences between the server and
 *  browser render can't cause an SVG hydration mismatch. */
function polar(r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const round = (n: number) => Math.round(n * 100) / 100;
  return { x: round(CX + r * Math.sin(rad)), y: round(CY - r * Math.cos(rad)) };
}

/** Twelve-hour label (0 → 12). */
function h12(hour: number): number {
  return hour === 0 ? 12 : hour;
}
function nextH12(hour: number): number {
  const h = h12(hour);
  return h === 12 ? 1 : h + 1;
}

/** Digital reading. English shows 12-hour + AM/PM; Croatian shows 24-hour
 *  (afternoon → 13–23) because that's how the time is written there. */
function digital(hour: number, minute: number, lang: Lang, pm: boolean): string {
  const mm = String(minute).padStart(2, "0");
  const h = h12(hour); // 1–12
  if (lang === "hr") {
    const h24 = pm ? (h === 12 ? 12 : h + 12) : h === 12 ? 0 : h;
    return `${h24}:${mm}`;
  }
  return `${h}:${mm} ${pm ? "PM" : "AM"}`;
}

/** Friendly spoken time, e.g. "half past six" / "šest i pol". */
function timeWords(hour: number, minute: number, lang: Lang): string {
  const h = h12(hour);
  const next = nextH12(hour);
  if (lang === "hr") {
    if (minute === 0) return `točno ${h}`;
    if (minute === 15) return `${h} i četvrt`;
    if (minute === 30) return `pola ${next} (ili ${h} i pol)`;
    if (minute === 45) return `četvrt do ${next}`;
    if (minute < 30) return `${h} i ${minute}`;
    return `${60 - minute} do ${next}`;
  }
  if (minute === 0) return `${h} o'clock`;
  if (minute === 15) return `quarter past ${h}`;
  if (minute === 30) return `half past ${h}`;
  if (minute === 45) return `quarter to ${next}`;
  if (minute < 30) return `${minute} ${minute === 1 ? "minute" : "minutes"} past ${h}`;
  const to = 60 - minute;
  return `${to} ${to === 1 ? "minute" : "minutes"} to ${next}`;
}

export default function ClockTool({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  // Single source of truth: minutes since 12:00, 0–719.
  const [total, setTotal] = useState(3 * 60 + 15); // 3:15
  const [pm, setPm] = useState(false); // morning / afternoon
  const [hidden, setHidden] = useState(false);
  const [revealed, setRevealed] = useState(false);
  // Mirrors dragging.current as state, so render can mute the live region
  // during a drag (announcing every tick is screen-reader spam).
  const [dragActive, setDragActive] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<"hour" | "minute" | null>(null);

  const hour = Math.floor(total / 60); // 0–11
  const minute = total % 60;

  const minuteAngle = minute * 6;
  const hourAngle = (hour % 12) * 30 + minute * 0.5;

  const setTime = (h: number, m: number) =>
    setTotal(((((h % 12) + 12) % 12) * 60 + ((m % 60) + 60) % 60));

  const step = (deltaMinutes: number) =>
    setTotal((prev) => (((prev + deltaMinutes) % 720) + 720) % 720);

  const randomize = () => {
    setTotal(Math.floor(Math.random() * 12) * 60 + Math.floor(Math.random() * 12) * 5);
    setRevealed(false);
  };

  /** Pointer angle relative to the clock centre, in SVG degrees (0 = top). */
  function pointerAngle(e: React.PointerEvent): number | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    // Map client px → the 240-unit viewBox space.
    const x = ((e.clientX - rect.left) / rect.width) * 240;
    const y = ((e.clientY - rect.top) / rect.height) * 240;
    const dx = x - CX;
    const dy = y - CY;
    let a = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (a < 0) a += 360;
    return a;
  }

  // Dragging does NOT reveal a hidden time: in practice mode the child moves
  // the hands, says the time out loud, and only "Show the time" checks it
  // (same contract as the stepper buttons).
  function onPointerDown(hand: "hour" | "minute", e: React.PointerEvent) {
    dragging.current = hand;
    setDragActive(true);
    svgRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const a = pointerAngle(e);
    if (a === null) return;

    if (dragging.current === "minute") {
      const newMin = Math.round(a / 6) % 60;
      let newHour = hour;
      // Carry the hour when the minute hand sweeps past the 12, like a real clock.
      if (minute > 45 && newMin < 15) newHour = (hour + 1) % 12;
      else if (minute < 15 && newMin > 45) newHour = (hour + 11) % 12;
      setTime(newHour, newMin);
    } else {
      // Undo the hour hand's minute-creep so it snaps to whole hours cleanly.
      const raw = Math.round((a - minute * 0.5) / 30);
      setTime(raw, minute);
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    dragging.current = null;
    setDragActive(false);
    svgRef.current?.releasePointerCapture(e.pointerId);
  }

  const hourEnd = polar(52, hourAngle);
  const minEnd = polar(80, minuteAngle);
  const showTime = !hidden || revealed;

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
        {/* Clock face + hand legend (they explain each other, so they travel together) */}
        <div className="flex shrink-0 flex-col items-center gap-3">
        <svg
          ref={svgRef}
          viewBox="0 0 240 240"
          width="240"
          height="240"
          className="w-56 max-w-full shrink-0 touch-none select-none"
          role="img"
          aria-label={`${t.clockLabel} ${digital(hour, minute, lang, pm)}`}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <circle cx={CX} cy={CY} r="116" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
          <circle cx={CX} cy={CY} r="112" fill="#F9FAFB" />

          {/* Minute ticks (hour ticks are longer/darker). */}
          {Array.from({ length: 60 }).map((_, i) => {
            const isHour = i % 5 === 0;
            const outer = polar(112, i * 6);
            const inner = polar(isHour ? 100 : 106, i * 6);
            return (
              <line
                key={i}
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke={isHour ? "#94a3b8" : "#d1d5db"}
                strokeWidth={isHour ? 2.5 : 1}
                strokeLinecap="round"
              />
            );
          })}

          {/* Numbers 1–12 */}
          {Array.from({ length: 12 }).map((_, i) => {
            const n = i + 1;
            const p = polar(88, n * 30);
            return (
              <text
                key={n}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-gray-700"
                style={{ fontSize: 20, fontWeight: 700 }}
              >
                {n}
              </text>
            );
          })}

          {/* Hour hand (short) */}
          <line
            x1={CX}
            y1={CY}
            x2={hourEnd.x}
            y2={hourEnd.y}
            stroke={HOUR_COLOR}
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Minute hand (long) */}
          <line
            x1={CX}
            y1={CY}
            x2={minEnd.x}
            y2={minEnd.y}
            stroke={MIN_COLOR}
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Fat transparent hit areas for easy grabbing (drawn last, on top). */}
          <line
            x1={CX}
            y1={CY}
            x2={hourEnd.x}
            y2={hourEnd.y}
            stroke="transparent"
            strokeWidth="26"
            strokeLinecap="round"
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => onPointerDown("hour", e)}
          />
          <line
            x1={CX}
            y1={CY}
            x2={minEnd.x}
            y2={minEnd.y}
            stroke="transparent"
            strokeWidth="26"
            strokeLinecap="round"
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => onPointerDown("minute", e)}
          />

          <circle cx={CX} cy={CY} r="7" fill={HOUR_COLOR} />
          <circle cx={CX} cy={CY} r="3" fill="#fff" />
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-5 rounded-full" style={{ background: HOUR_COLOR }} />
            {t.hourHand}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-6 rounded-full" style={{ background: MIN_COLOR }} />
            {t.minuteHand}
          </span>
        </div>
        </div>

        {/* Read-out + controls */}
        <div className="w-full">
          <p className="text-sm text-gray-500">{t.reads}</p>
          <div aria-live={dragActive ? "off" : "polite"} className="min-h-[4.5rem]">
            {showTime ? (
              <>
                <p className="text-4xl font-bold tabular-nums text-gray-900">
                  {digital(hour, minute, lang, pm)}
                </p>
                <p className="mt-1 text-lg font-medium first-letter:uppercase" style={{ color: MIN_COLOR }}>
                  {timeWords(hour, minute, lang)}
                </p>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="mt-1 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
              >
                {t.show}
              </button>
            )}
          </div>

          {/* Morning / afternoon — an analog face can't show it, so pick here.
              In Croatian this switches the digital read-out to 24-hour time. */}
          <div className="mt-3">
            <span className="block text-xs text-gray-500">{t.period}</span>
            <div className="mt-1 inline-flex rounded-full bg-gray-100 p-0.5 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setPm(false)}
                aria-pressed={!pm}
                className={`rounded-full px-3 py-1 transition ${!pm ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
              >
                {t.morning}
              </button>
              <button
                type="button"
                onClick={() => setPm(true)}
                aria-pressed={pm}
                className={`rounded-full px-3 py-1 transition ${pm ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
              >
                {t.afternoon}
              </button>
            </div>
          </div>

          {/* Set the time: drag hint + stepper buttons (keyboard-friendly) */}
          <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="mb-2 text-xs text-gray-400">
            {hidden ? t.practiceHint : t.dragHint}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:max-w-xs">
            <button type="button" onClick={() => step(-60)} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">
              {t.hourMinus}
            </button>
            <button type="button" onClick={() => step(60)} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">
              {t.hourPlus}
            </button>
            <button type="button" onClick={() => step(-5)} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">
              {t.minMinus}
            </button>
            <button type="button" onClick={() => step(5)} className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">
              {t.minPlus}
            </button>
          </div>
          </div>

          {/* Practice: random time + hide-and-guess */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={randomize}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              {t.random}
            </button>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={hidden}
                onChange={(e) => {
                  setHidden(e.target.checked);
                  setRevealed(false);
                }}
                className="h-4 w-4 accent-brand"
              />
              {t.hide}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
