"use client";

import { useState } from "react";

type Lang = "en" | "hr";

const COPY = {
  en: {
    numerator: "Numerator",
    numeratorHint: "(shaded parts)",
    denominator: "Denominator",
    denominatorHint: "(equal parts)",
    decimal: "Decimal",
    simplifies: "Simplifies to",
    whole: "That's one whole! 🎉",
  },
  hr: {
    numerator: "Brojnik",
    numeratorHint: "(obojani dijelovi)",
    denominator: "Nazivnik",
    denominatorHint: "(jednaki dijelovi)",
    decimal: "Decimalno",
    simplifies: "Skraćuje se na",
    whole: "To je jedna cijela! 🎉",
  },
} as const;

const FILL = "#4f46e5";
const EMPTY = "#E5E7EB";

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

// SVG path for a pie sector from `a0` to `a1` degrees (0° = top, clockwise).
function sector(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p0 = ((a0 - 90) * Math.PI) / 180;
  const p1 = ((a1 - 90) * Math.PI) / 180;
  const x0 = cx + r * Math.cos(p0);
  const y0 = cy + r * Math.sin(p0);
  const x1 = cx + r * Math.cos(p1);
  const y1 = cy + r * Math.sin(p1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`;
}

export default function FractionVisualizer({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [num, setNum] = useState(3);
  const [denom, setDenom] = useState(4);

  const setNumClamped = (n: number) => setNum(Math.min(denom, Math.max(0, n)));
  const setDenomClamped = (d: number) => {
    const nd = Math.min(12, Math.max(1, d));
    setDenom(nd);
    if (num > nd) setNum(nd);
  };

  const dec = num / denom;
  const decStr = parseFloat(dec.toFixed(3));
  const approx = decStr !== dec;
  const pct = Math.round(dec * 100);
  const g = num > 0 ? gcd(num, denom) : 1;

  const stepper = (
    label: string,
    hint: string,
    value: number,
    onChange: (n: number) => void,
    min: number,
    max: number,
  ) => (
    <div>
      <div className="text-sm font-medium text-gray-600">
        {label} <span className="text-gray-400">{hint}</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`${label} −`}
          className="h-9 w-9 rounded-lg bg-gray-100 text-lg font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-40"
        >
          −
        </button>
        <span className="w-8 text-center text-xl font-bold text-gray-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`${label} +`}
          className="h-9 w-9 rounded-lg bg-gray-100 text-lg font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        {stepper(t.numerator, t.numeratorHint, num, setNumClamped, 0, denom)}
        {stepper(t.denominator, t.denominatorHint, denom, setDenomClamped, 1, 12)}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
        <svg viewBox="0 0 160 160" width="150" height="150" aria-hidden="true">
          {denom === 1 ? (
            <circle cx="80" cy="80" r="72" fill={num >= 1 ? FILL : EMPTY} stroke="#fff" strokeWidth="2" />
          ) : (
            Array.from({ length: denom }).map((_, i) => (
              <path
                key={i}
                d={sector(80, 80, 72, (i * 360) / denom, ((i + 1) * 360) / denom)}
                fill={i < num ? FILL : EMPTY}
                stroke="#fff"
                strokeWidth="2"
              />
            ))
          )}
        </svg>

        <div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center leading-none">
              <span className="text-3xl font-bold text-gray-900">{num}</span>
              <span className="my-1 h-0.5 w-8 bg-gray-900" />
              <span className="text-3xl font-bold text-gray-900">{denom}</span>
            </div>
            <span className="text-2xl text-gray-300">=</span>
            <div>
              <div className="text-3xl font-bold" style={{ color: FILL }}>{pct}%</div>
              <div className="text-sm text-gray-500">
                {t.decimal}: {approx ? "≈ " : ""}{decStr}
              </div>
            </div>
          </div>
          {g > 1 && (
            <p className="mt-3 text-sm text-gray-600">
              {t.simplifies}{" "}
              <b className="text-gray-900">
                {num / g}/{denom / g}
              </b>
            </p>
          )}
          {num === denom && <p className="mt-3 text-sm font-semibold text-green-700">{t.whole}</p>}
        </div>
      </div>

      <div className="mt-5 flex gap-1">
        {Array.from({ length: denom }).map((_, i) => (
          <div
            key={i}
            className="h-8 flex-1 rounded"
            style={{ background: i < num ? FILL : EMPTY }}
          />
        ))}
      </div>
    </div>
  );
}
