"use client";

import { useMemo, useState } from "react";

type Lang = "en" | "hr";

const COPY = {
  en: {
    label: "Type a name",
    beads: "beads",
    zero: "0",
    one: "1",
    empty: "Type a name above to see it in binary.",
    note8: "Each letter is one byte, exactly 8 beads.",
    note16: "Letters with accents (Č, Ž, Đ…) need 16 beads instead of 8.",
  },
  hr: {
    label: "Upišite ime",
    beads: "perli",
    zero: "0",
    one: "1",
    empty: "Upišite ime iznad da ga vidite u binarnom kodu.",
    note8: "Svako slovo je jedan bajt, točno 8 perli.",
    note16: "Slova s kvačicama (Č, Ž, Đ…) trebaju 16 perli umjesto 8.",
  },
} as const;

const ON = "#D85A30";

/** Encode a name to per-letter bit strings via real UTF-8 bytes, so accented
 *  Croatian letters correctly come out as 16 bits (2 bytes). */
function encodeName(name: string): { ch: string; bits: string }[] {
  const enc = new TextEncoder();
  const out: { ch: string; bits: string }[] = [];
  for (const ch of name) {
    if (ch === " ") {
      out.push({ ch: " ", bits: "" });
      continue;
    }
    const bits = Array.from(enc.encode(ch))
      .map((b) => b.toString(2).padStart(8, "0"))
      .join("");
    out.push({ ch, bits });
  }
  return out;
}

export default function NameInBinary({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [name, setName] = useState("LEA");
  const upper = name.toUpperCase();
  const letters = useMemo(() => encodeName(upper), [upper]);
  const totalBeads = letters.reduce((n, l) => n + l.bits.length, 0);
  const hasWide = letters.some((l) => l.bits.length > 8);

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <div className="flex items-center gap-3">
        <label htmlFor="nib-input" className="text-sm text-gray-600">
          {t.label}
        </label>
        <input
          id="nib-input"
          type="text"
          maxLength={14}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-[#FB6F52]"
        />
      </div>

      <div className="mt-4 flex items-center gap-5 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded-full border border-gray-300 bg-white" aria-hidden="true" />
          {t.zero}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded-full" style={{ background: ON }} aria-hidden="true" />
          {t.one}
        </span>
        <span className="ml-auto">
          <span className="text-xl font-bold text-gray-900">{totalBeads}</span> {t.beads}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-4">
        {upper.trim() === "" ? (
          <p className="text-sm text-gray-400">{t.empty}</p>
        ) : (
          letters.map((l, i) =>
            l.ch === " " ? (
              <span key={i} className="w-5" aria-hidden="true" />
            ) : (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="flex gap-1">
                  {[...l.bits].map((b, j) => (
                    <span
                      key={j}
                      className="h-4 w-4 rounded-full"
                      style={
                        b === "1"
                          ? { background: ON }
                          : { background: "#fff", border: "1.5px solid #D3D1C7" }
                      }
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <div className="font-mono text-xs text-gray-500">
                  {l.ch} · {l.bits.replace(/(.{8})/g, "$1 ").trim()}
                </div>
              </div>
            ),
          )
        )}
      </div>

      <p className="mt-3 text-xs text-gray-400">{hasWide ? t.note16 : t.note8}</p>
    </div>
  );
}
