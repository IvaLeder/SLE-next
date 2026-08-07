"use client";

import { useState } from "react";

type Lang = "en" | "hr";

const MAX = 99999;

const COPY = {
  en: {
    label: "Pick a number",
    hint: `Any whole number from 0 to ${MAX.toLocaleString("en")}.`,
    tooBig: `That is past ${MAX.toLocaleString("en")}. Try a smaller number.`,
    noZero: "This system has no symbol for zero. There is simply nothing to write.",
    tooMany: (n: number) => `That would take ${n} marks in a row. Too many to draw, which is rather the point.`,
    romanLimit: "Roman numerals stop being practical here. Above 3,999 the Romans drew a line over a numeral to multiply it by a thousand.",
    tryThese: "Try these:",
    shortest: "Fewest symbols",
    longest: "Most symbols",
    systems: {
      tally: {
        name: "Tally marks",
        how: "One mark per thing, crossed through in groups of five. The oldest counting there is.",
      },
      egyptian: {
        name: "Ancient Egyptian",
        how: "A different picture for 1, 10, 100, 1,000 and up. Repeat each one as often as you need.",
      },
      babylonian: {
        name: "Babylonian",
        how: "Wedges pressed into clay, counted in sixties. This is why an hour has 60 minutes.",
      },
      mayan: {
        name: "Maya",
        how: "A dot is 1, a bar is 5, and a shell is zero. Places are worth twenty times the one below.",
      },
      roman: {
        name: "Roman",
        how: "Letters added up, with a smaller letter before a bigger one meaning subtract.",
      },
      binary: {
        name: "Binary",
        how: "Only two digits, 0 and 1. Every place is worth double the one before. The code inside every computer.",
      },
      arabic: {
        name: "Our digits today",
        how: "Ten digits, including a zero, and the place of a digit tells you its value.",
      },
    },
  },
  hr: {
    label: "Odaberite broj",
    hint: `Bilo koji cijeli broj od 0 do ${MAX.toLocaleString("hr")}.`,
    tooBig: `To je više od ${MAX.toLocaleString("hr")}. Pokušajte s manjim brojem.`,
    noZero: "Ovaj sustav nema znak za nulu. Jednostavno se nema što napisati.",
    tooMany: (n: number) => `To bi bilo ${n} crtica u nizu. Previše za nacrtati, a upravo je to ono što želimo pokazati.`,
    romanLimit: "Ovdje rimski brojevi prestaju biti praktični. Iznad 3.999 Rimljani su iznad broja crtali crtu koja ga množi s tisuću.",
    tryThese: "Isprobajte:",
    shortest: "Najmanje znakova",
    longest: "Najviše znakova",
    systems: {
      tally: {
        name: "Crtice",
        how: "Jedna crtica po stvari, precrtane u skupinama od pet. Najstarije brojanje koje postoji.",
      },
      egyptian: {
        name: "Staroegipatski",
        how: "Poseban crtež za 1, 10, 100, 1000 i dalje. Svaki se ponavlja onoliko puta koliko treba.",
      },
      babylonian: {
        name: "Babilonski",
        how: "Klinovi utisnuti u glinu, brojeni po šezdeset. Zato sat ima 60 minuta.",
      },
      mayan: {
        name: "Majanski",
        how: "Točka je 1, crta je 5, a školjka je nula. Svako mjesto vrijedi dvadeset puta više od onog ispod.",
      },
      roman: {
        name: "Rimski",
        how: "Slova koja se zbrajaju, a manje slovo ispred većeg znači oduzimanje.",
      },
      binary: {
        name: "Binarni",
        how: "Samo dvije znamenke, 0 i 1. Svako mjesto vrijedi dvostruko više od prethodnog. Kod svakog računala.",
      },
      arabic: {
        name: "Naše znamenke danas",
        how: "Deset znamenki, uključujući nulu, a mjesto znamenke govori koliko ona vrijedi.",
      },
    },
  },
} as const;

/** "4 symbols" / "4 znaka" — Croatian needs real pluralization:
 *  1 znak, 2–4 znaka, 5+ znakova (except 12–14 → znakova). Mirrors the
 *  pageCount helper in `src/components/mdx/Printable.tsx`. */
function symbolCount(lang: Lang, n: number): string {
  if (lang === "en") return n === 1 ? "1 symbol" : `${n} symbols`;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} znak`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return `${n} znaka`;
  return `${n} znakova`;
}

/* ────────────────────────────── conversions ────────────────────────────── */

// Roman numerals, subtractive form. Valid up to 3999; above that the Romans
// used an overline (vinculum) we deliberately don't try to draw.
const ROMAN: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];
function toRoman(n: number): string {
  let out = "";
  let rest = n;
  for (const [value, letters] of ROMAN) {
    while (rest >= value) {
      out += letters;
      rest -= value;
    }
  }
  return out;
}

// Split a number into place-value digits for any base, most significant first.
function toBase(n: number, base: number): number[] {
  if (n === 0) return [0];
  const digits: number[] = [];
  let rest = n;
  while (rest > 0) {
    digits.unshift(rest % base);
    rest = Math.floor(rest / base);
  }
  return digits;
}

// Egyptian: how many of each power-of-ten sign, from 1,000,000 down to 1.
const EGYPT_VALUES = [1000000, 100000, 10000, 1000, 100, 10, 1] as const;
function egyptianCounts(n: number): { value: number; count: number }[] {
  let rest = n;
  return EGYPT_VALUES.map((value) => {
    const count = Math.floor(rest / value);
    rest -= count * value;
    return { value, count };
  }).filter((g) => g.count > 0);
}

/* ─────────────────────────── symbol rendering ──────────────────────────── */

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

// One Egyptian numeral sign, drawn simply rather than reproduced exactly.
function EgyptSign({ value }: { value: number }) {
  const paths: Record<number, React.ReactNode> = {
    1: <path d="M20 6 V54" {...stroke} />,
    10: <path d="M6 50 A18 18 0 0 1 42 50" {...stroke} />,
    100: <path d="M8 50 C8 20 40 20 40 34 C40 44 22 44 22 34 C22 28 30 28 31 33" {...stroke} />,
    1000: <path d="M24 54 V28 M24 28 C10 24 6 14 8 7 C17 8 22 18 24 28 M24 28 C38 24 42 14 40 7 C31 8 26 18 24 28 M24 28 C20 19 20 10 24 4 C28 10 28 19 24 28" {...stroke} />,
    10000: <path d="M17 54 V21 C17 11 31 11 31 21 V54 M20 25 C22 20 26 20 28 25" {...stroke} />,
    100000: <path d="M14 20 C4 20 4 40 14 40 C24 40 26 30 26 30 C34 26 40 34 44 40 M40 20 C36 26 32 28 26 30" {...stroke} />,
    1000000: <path d="M24 54 V34 M24 34 C18 34 14 30 14 24 M8 8 C10 20 16 26 24 26 C32 26 38 20 40 8 M14 54 H34" {...stroke} />,
  };
  return (
    <svg viewBox="0 0 48 60" className="h-7 w-6 text-brand" aria-hidden="true">
      {paths[value]}
    </svg>
  );
}

// Tally: groups of five, the fifth mark struck across the other four.
function TallyGroup({ count }: { count: number }) {
  return (
    <svg viewBox="0 0 52 44" className="h-8 w-10 text-brand" aria-hidden="true">
      {Array.from({ length: Math.min(count, 4) }, (_, i) => (
        <path key={i} d={`M${6 + i * 10} 6 V38`} {...stroke} strokeWidth={5} />
      ))}
      {count === 5 && <path d="M2 36 L42 8" {...stroke} strokeWidth={5} />}
    </svg>
  );
}

// Babylonian: a narrow downward wedge for 1, a sideways wedge for 10. Units
// stack in rows of three the way scribes packed them into a clay column.
function BabylonianPlace({ digit }: { digit: number }) {
  const tens = Math.floor(digit / 10);
  const ones = digit % 10;
  if (digit === 0) {
    return <span className="text-2xl leading-none text-gray-300">·</span>;
  }
  return (
    <span className="flex items-start gap-1">
      {tens > 0 && (
        <span className="flex flex-col gap-0.5">
          {Array.from({ length: Math.ceil(tens / 3) }, (_, row) => (
            <span key={row} className="flex gap-0.5">
              {Array.from({ length: Math.min(3, tens - row * 3) }, (_, i) => (
                <svg key={i} viewBox="0 0 24 20" className="h-4 w-5 text-brand" aria-hidden="true">
                  <path d="M2 10 L22 2 L22 18 Z" fill="currentColor" />
                </svg>
              ))}
            </span>
          ))}
        </span>
      )}
      {ones > 0 && (
        <span className="flex flex-col gap-0.5">
          {Array.from({ length: Math.ceil(ones / 3) }, (_, row) => (
            <span key={row} className="flex gap-0.5">
              {Array.from({ length: Math.min(3, ones - row * 3) }, (_, i) => (
                <svg key={i} viewBox="0 0 14 24" className="h-4 w-2.5 text-brand" aria-hidden="true">
                  <path d="M7 22 L1 2 L13 2 Z" fill="currentColor" />
                </svg>
              ))}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

// Maya: bars (5) stacked under dots (1), shell for zero, written in columns.
function MayanPlace({ digit }: { digit: number }) {
  const bars = Math.floor(digit / 5);
  const dots = digit % 5;
  if (digit === 0) {
    return (
      <svg viewBox="0 0 40 22" className="h-5 w-9 text-brand" aria-hidden="true">
        <path d="M4 16 C4 4 36 4 36 16 C28 20 12 20 4 16 Z M12 14 C14 9 18 8 20 8 M28 14 C26 9 22 8 20 8" {...stroke} strokeWidth={3} />
      </svg>
    );
  }
  return (
    <span className="flex flex-col items-center gap-1">
      {dots > 0 && (
        <span className="flex gap-1">
          {Array.from({ length: dots }, (_, i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-brand" />
          ))}
        </span>
      )}
      {Array.from({ length: bars }, (_, i) => (
        <span key={i} className="h-1.5 w-9 rounded-sm bg-brand" />
      ))}
    </span>
  );
}

/* ──────────────────────────────── the tool ─────────────────────────────── */

const PRESETS = [7, 12, 60, 400, 2026, 99999, 0];

type Row = {
  key: keyof typeof COPY.en.systems;
  count: number | null; // symbols needed; null when the system can't write it
  body: React.ReactNode;
};

export default function NumberSystems({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [raw, setRaw] = useState("2026");

  const parsed = Number.parseInt(raw.replace(/\D/g, ""), 10);
  const tooBig = Number.isFinite(parsed) && parsed > MAX;
  const n = Number.isFinite(parsed) && !tooBig ? parsed : null;

  // A short note under a system, used for zero, overflow and Roman's ceiling.
  const note = (text: string) => (
    <p className="text-sm italic leading-relaxed text-gray-500">{text}</p>
  );

  const rows: Row[] = n === null ? [] : [
    (() => {
      if (n === 0) return { key: "tally" as const, count: null, body: note(t.noZero) };
      if (n > 100) return { key: "tally" as const, count: n, body: note(t.tooMany(n)) };
      const groups = Math.ceil(n / 5);
      return {
        key: "tally" as const,
        count: n,
        body: (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {Array.from({ length: groups }, (_, i) => (
              <TallyGroup key={i} count={Math.min(5, n - i * 5)} />
            ))}
          </span>
        ),
      };
    })(),
    (() => {
      if (n === 0) return { key: "egyptian" as const, count: null, body: note(t.noZero) };
      const groups = egyptianCounts(n);
      return {
        key: "egyptian" as const,
        count: groups.reduce((sum, g) => sum + g.count, 0),
        body: (
          <span className="flex flex-wrap items-end gap-x-3 gap-y-1">
            {groups.map((g) => (
              <span key={g.value} className="flex flex-wrap gap-0.5">
                {Array.from({ length: g.count }, (_, i) => (
                  <EgyptSign key={i} value={g.value} />
                ))}
              </span>
            ))}
          </span>
        ),
      };
    })(),
    (() => {
      if (n === 0) return { key: "babylonian" as const, count: null, body: note(t.noZero) };
      const places = toBase(n, 60);
      return {
        key: "babylonian" as const,
        count: places.reduce((sum, d) => sum + Math.floor(d / 10) + (d % 10), 0),
        body: (
          <span className="flex flex-wrap items-start gap-3">
            {places.map((d, i) => (
              <span key={i} className="rounded-lg bg-brand-soft px-2 py-1">
                <BabylonianPlace digit={d} />
              </span>
            ))}
          </span>
        ),
      };
    })(),
    (() => {
      const places = toBase(n, 20);
      return {
        key: "mayan" as const,
        count: places.reduce((sum, d) => sum + (d === 0 ? 1 : Math.floor(d / 5) + (d % 5)), 0),
        // Highest place on top, the way the Maya wrote their columns. Hairlines
        // between rows so neighbouring places don't read as one heap of dots.
        body: (
          <span className="inline-flex flex-col rounded-lg bg-brand-soft px-4 py-1">
            {places.map((d, i) => (
              <span
                key={i}
                className={`flex justify-center py-2 ${i > 0 ? "border-t border-brand/15" : ""}`}
              >
                <MayanPlace digit={d} />
              </span>
            ))}
          </span>
        ),
      };
    })(),
    (() => {
      if (n === 0) return { key: "roman" as const, count: null, body: note(t.noZero) };
      if (n > 3999) return { key: "roman" as const, count: null, body: note(t.romanLimit) };
      const roman = toRoman(n);
      return {
        key: "roman" as const,
        count: roman.length,
        body: <span className="font-mono text-2xl font-bold tracking-wide text-brand">{roman}</span>,
      };
    })(),
    (() => {
      const bits = n.toString(2);
      return {
        key: "binary" as const,
        count: bits.length,
        body: <span className="break-all font-mono text-xl font-bold text-brand">{bits}</span>,
      };
    })(),
    {
      key: "arabic",
      count: String(n).length,
      body: <span className="font-mono text-2xl font-bold text-brand">{n}</span>,
    },
  ];

  // Which systems win and lose on symbol count — the whole argument for place
  // value, made without a word of explanation.
  const counts = rows.map((r) => r.count).filter((c): c is number => c !== null);
  const min = counts.length ? Math.min(...counts) : null;
  const max = counts.length ? Math.max(...counts) : null;

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <label htmlFor="numsys-input" className="block text-sm font-medium text-gray-600">
        {t.label}
      </label>
      <input
        id="numsys-input"
        type="text"
        inputMode="numeric"
        value={raw}
        onChange={(e) => setRaw(e.target.value.slice(0, 7))}
        className="mt-1 w-40 rounded-lg border border-gray-300 px-3 py-2 font-mono text-xl focus:outline-none focus:ring-2 focus:ring-brand"
      />
      <p className="mt-1 text-xs text-gray-400">{t.hint}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-500">{t.tryThese}</span>
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setRaw(String(p))}
            aria-pressed={n === p}
            className={`rounded-lg px-3 py-1 text-sm font-semibold transition-colors ${
              n === p ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p.toLocaleString(lang)}
          </button>
        ))}
      </div>

      {tooBig && <p className="mt-4 text-sm font-medium text-amber-700">{t.tooBig}</p>}

      <div className="mt-5 space-y-3">
        {rows.map((row) => {
          const s = t.systems[row.key];
          return (
            <div key={row.key} className="rounded-xl border border-gray-100 bg-brand-soft/30 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-gray-800">{s.name}</h3>
                {row.count !== null && (
                  <span className="flex items-center gap-2 text-xs text-gray-500">
                    {row.count === min && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                        {t.shortest}
                      </span>
                    )}
                    {row.count === max && min !== max && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
                        {t.longest}
                      </span>
                    )}
                    {symbolCount(lang, row.count)}
                  </span>
                )}
              </div>
              <div className="mt-3 min-h-[2.5rem]">{row.body}</div>
              <p className="mt-3 text-xs leading-relaxed text-gray-500">{s.how}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
