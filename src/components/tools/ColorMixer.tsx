"use client";

import { useState } from "react";

type Lang = "en" | "hr";
type Mode = "mix" | "quiz";
type Model = "paint" | "light";

/**
 * Paint mixes come from a hand-picked lookup table, NOT from RGB math:
 * averaging #378ADD blue and yellow on a screen gives gray, while real paint
 * gives green. The table encodes the subtractive (RYB) results the article
 * teaches, with hexes chosen to look right next to the source pots.
 * Light mode (additive RGB) is the one place numeric intuition IS correct,
 * but three fixed lights only have four outcomes, so it's a table too.
 */
interface Pot {
  id: string;
  hex: string;
  name: Record<Lang, string>;
}

type MixKind = "secondary" | "tertiary" | "mud" | "muted" | "light2" | "light3";

interface Mix {
  hex: string;
  name: Record<Lang, string>;
  kind: MixKind;
}

const PAINTS: Pot[] = [
  { id: "red", hex: "#E24B4A", name: { en: "red", hr: "crvena" } },
  { id: "yellow", hex: "#F5D033", name: { en: "yellow", hr: "žuta" } },
  { id: "blue", hex: "#378ADD", name: { en: "blue", hr: "plava" } },
  { id: "orange", hex: "#EF8A2B", name: { en: "orange", hr: "narančasta" } },
  { id: "green", hex: "#639922", name: { en: "green", hr: "zelena" } },
  { id: "violet", hex: "#8A5BC4", name: { en: "violet", hr: "ljubičasta" } },
];

const LIGHTS: Pot[] = [
  { id: "red", hex: "#E8352E", name: { en: "red", hr: "crveno" } },
  { id: "green", hex: "#2EBD3C", name: { en: "green", hr: "zeleno" } },
  { id: "blue", hex: "#2E6CF6", name: { en: "blue", hr: "plavo" } },
];

/** Key = selected pot ids, sorted and joined with "+". */
const PAINT_MIX: Record<string, Mix> = {
  // primary + primary → secondary
  "red+yellow": { hex: "#EF8A2B", name: { en: "orange", hr: "narančasta" }, kind: "secondary" },
  "blue+yellow": { hex: "#639922", name: { en: "green", hr: "zelena" }, kind: "secondary" },
  "blue+red": { hex: "#8A5BC4", name: { en: "violet", hr: "ljubičasta" }, kind: "secondary" },
  // primary + neighbouring secondary → tertiary
  "orange+red": { hex: "#E86A2E", name: { en: "red-orange", hr: "crveno-narančasta" }, kind: "tertiary" },
  "orange+yellow": { hex: "#F2A930", name: { en: "yellow-orange", hr: "žuto-narančasta" }, kind: "tertiary" },
  "green+yellow": { hex: "#A9B32B", name: { en: "yellow-green", hr: "žuto-zelena" }, kind: "tertiary" },
  "blue+green": { hex: "#3F9C8C", name: { en: "blue-green", hr: "plavo-zelena" }, kind: "tertiary" },
  "blue+violet": { hex: "#5F6FD0", name: { en: "blue-violet", hr: "plavo-ljubičasta" }, kind: "tertiary" },
  "red+violet": { hex: "#B94F8E", name: { en: "red-violet", hr: "crveno-ljubičasta" }, kind: "tertiary" },
  // complementary pairs → mud (the honest real-paint answer)
  "green+red": { hex: "#8B5A33", name: { en: "brown", hr: "smeđa" }, kind: "mud" },
  "violet+yellow": { hex: "#8D7A5E", name: { en: "brownish gray", hr: "smećkasto siva" }, kind: "mud" },
  "blue+orange": { hex: "#7A6248", name: { en: "muddy brown", hr: "blatno smeđa" }, kind: "mud" },
  // secondary + secondary → muted, earthy colours
  "green+orange": { hex: "#8F8A2E", name: { en: "olive", hr: "maslinasta" }, kind: "muted" },
  "orange+violet": { hex: "#9A5A44", name: { en: "russet", hr: "crvenkasto smeđa" }, kind: "muted" },
  "green+violet": { hex: "#6B7B8C", name: { en: "slate gray", hr: "plavkasto siva" }, kind: "muted" },
};

const LIGHT_MIX: Record<string, Mix> = {
  "green+red": { hex: "#F5D033", name: { en: "yellow", hr: "žuta" }, kind: "light2" },
  "blue+red": { hex: "#E145B8", name: { en: "magenta", hr: "magenta" }, kind: "light2" },
  "blue+green": { hex: "#37C3DD", name: { en: "cyan", hr: "cijan" }, kind: "light2" },
  "blue+green+red": { hex: "#FFFFFF", name: { en: "white", hr: "bijela" }, kind: "light3" },
};

const COPY = {
  en: {
    mix: "Mix colors",
    quiz: "Quiz: guess the mix",
    paint: "🎨 Paint",
    light: "💡 Light",
    pickTwo: "Tap two pots to mix them",
    pickThird: "Now try adding the third light!",
    secondary: "Two primary colors make a secondary color!",
    tertiary: "A primary + a secondary make a tertiary color.",
    mud: "Complementary colors cancel each other out into brown. Real paints do this too!",
    muted: "Two secondary colors make a muted, earthy color.",
    light2: "Colored light adds up instead of getting darker. This is the additive model, the one screens use.",
    light3: "All three lights together make white light!",
    youMade: "You made",
    tintLabel: "Add white or black",
    black: "black",
    white: "white",
    pure: "pure color",
    tint: "tint (lighter)",
    shade: "shade (darker)",
    tintExplain: "Adding white makes a tint - a lighter color.",
    shadeExplain: "Adding black makes a shade - a darker color.",
    lighter: "light",
    darker: "dark",
    clear: "✕ Clear",
    qForward: (a: string, b: string) => `What do ${a} and ${b} make?`,
    qReverse: (c: string) => `Which two colors make ${c}?`,
    correct: "That's it! 🎉",
    wrong: "Not quite. Try again!",
    newQ: "🔄 New question",
    plus: "plus",
  },
  hr: {
    mix: "Miješaj boje",
    quiz: "Kviz: pogodi boju",
    paint: "🎨 Boja",
    light: "💡 Svjetlost",
    pickTwo: "Dodirni dva lončića da pomiješaš boje",
    pickThird: "Dodaj sada i treće svjetlo!",
    secondary: "Dvije primarne boje daju sekundarnu boju!",
    tertiary: "Primarna + sekundarna daju tercijarnu boju.",
    mud: "Komplementarne boje se međusobno ponište u smeđu. Tako je i s pravim bojama!",
    muted: "Dvije sekundarne boje daju prigušenu, zemljanu boju.",
    light2: "Obojena svjetlost se zbraja umjesto da tamni. To je aditivni model, onaj koji koriste ekrani.",
    light3: "Sva tri svjetla zajedno daju bijelu svjetlost!",
    youMade: "Dobili ste:",
    tintLabel: "Dodaj bijelu ili crnu",
    black: "crna",
    white: "bijela",
    pure: "čista boja",
    tint: "svjetliji ton (tinta)",
    shade: "tamniji ton (sjena)",
    tintExplain: "Dodavanjem bijele nastaje svjetliji ton (tinta).",
    shadeExplain: "Dodavanjem crne nastaje tamniji ton (sjena).",
    lighter: "svijetlo",
    darker: "tamno",
    clear: "✕ Očisti",
    qForward: (a: string, b: string) => `Koju boju daju ${a} i ${b}?`,
    // The target is always a feminine colour name (narančasta/zelena/ljubičasta),
    // so nominative -a → accusative -u is safe here.
    qReverse: (c: string) => `Koje dvije boje daju ${c.replace(/a$/, "u")}?`,
    correct: "Tako je! 🎉",
    wrong: "Nije baš. Pokušaj ponovno!",
    newQ: "🔄 Novo pitanje",
    plus: "plus",
  },
} as const;

function mixFor(model: Model, ids: string[]): Mix | null {
  if (ids.length < 2) return null;
  const key = [...ids].sort().join("+");
  const table = model === "paint" ? PAINT_MIX : LIGHT_MIX;
  return table[key] ?? null;
}

function lerpHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa
    .map((v, i) =>
      Math.round(v + (pb[i] - v) * t)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

/** tint −1..1: negative mixes toward black (shade), positive toward white (tint). */
function applyTint(hex: string, tint: number): string {
  if (tint === 0) return hex;
  return tint > 0 ? lerpHex(hex, "#FFFFFF", tint * 0.72) : lerpHex(hex, "#000000", -tint * 0.6);
}

/* ---------------- Quiz ---------------- */

const QUIZ_PAIRS: [string, string][] = [
  ["red", "yellow"],
  ["blue", "yellow"],
  ["blue", "red"],
];

interface Round {
  type: "forward" | "reverse";
  pairIdx: number; // index into QUIZ_PAIRS; the mix of that pair is the target
  options: number[]; // shuffled indices into QUIZ_PAIRS (each stands for its pair or its mix)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// First (SSR) round is deterministic so server and client markup agree.
function buildRound(rnd = true): Round {
  const type: Round["type"] = rnd && Math.random() < 0.5 ? "reverse" : "forward";
  const pairIdx = rnd ? Math.floor(Math.random() * QUIZ_PAIRS.length) : 0;
  const options = rnd ? shuffle([0, 1, 2]) : [0, 1, 2];
  return { type, pairIdx, options };
}

function potById(ids: Pot[], id: string): Pot {
  return ids.find((p) => p.id === id)!;
}

function pairMix(pair: [string, string]): Mix {
  return PAINT_MIX[[...pair].sort().join("+")];
}

/* ---------------- UI bits ---------------- */

function Swatch({
  hex,
  size = 48,
  ring = false,
}: {
  hex: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block rounded-full border ${ring ? "border-gray-400" : "border-black/10"}`}
      style={{ width: size, height: size, backgroundColor: hex }}
    />
  );
}

function EmptySlot({ size = 48 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-lg text-gray-400"
      style={{ width: size, height: size }}
    >
      ?
    </span>
  );
}

export default function ColorMixer({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [mode, setMode] = useState<Mode>("mix");
  const [model, setModel] = useState<Model>("paint");
  const [selected, setSelected] = useState<string[]>([]);
  const [tint, setTint] = useState(0);

  const [round, setRound] = useState<Round>(() => buildRound(false));
  const [solved, setSolved] = useState(false);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);

  const pots = model === "paint" ? PAINTS : LIGHTS;
  const maxSel = model === "paint" ? 2 : 3;
  const mix = mixFor(model, selected);
  const shownHex = mix && model === "paint" ? applyTint(mix.hex, tint) : mix?.hex;

  const togglePot = (id: string) => {
    setTint(0);
    setSelected((sel) => {
      if (sel.includes(id)) return sel.filter((s) => s !== id);
      if (sel.length >= maxSel) return [...sel.slice(1), id]; // replace the oldest pick
      return [...sel, id];
    });
  };

  const switchModel = (m: Model) => {
    setModel(m);
    setSelected([]);
    setTint(0);
  };

  const newRound = () => {
    setRound(buildRound());
    setSolved(false);
    setStatus("idle");
    setWrongIdx(null);
  };

  const answer = (optIdx: number) => {
    if (solved) return;
    if (round.options[optIdx] === round.pairIdx) {
      setSolved(true);
      setStatus("correct");
    } else {
      setStatus("wrong");
      setWrongIdx(optIdx);
      setTimeout(() => setWrongIdx(null), 600);
    }
  };

  const pill = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      active ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;
  const ghost =
    "inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200";

  const tintState = tint === 0 ? t.pure : tint > 0 ? t.tint : t.shade;
  const mixedName =
    mix &&
    (model === "paint" && Math.abs(tint) > 0.15
      ? `${tint > 0 ? t.lighter : t.darker} ${mix.name[lang]}`
      : mix.name[lang]);

  const qPair = QUIZ_PAIRS[round.pairIdx];
  const qMix = pairMix(qPair);
  const question =
    round.type === "forward"
      ? t.qForward(potById(PAINTS, qPair[0]).name[lang], potById(PAINTS, qPair[1]).name[lang])
      : t.qReverse(qMix.name[lang]);

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      {/* Mode */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("mix")} aria-pressed={mode === "mix"} className={`flex-1 ${pill(mode === "mix")}`}>
          {t.mix}
        </button>
        <button type="button" onClick={() => setMode("quiz")} aria-pressed={mode === "quiz"} className={`flex-1 ${pill(mode === "quiz")}`}>
          {t.quiz}
        </button>
      </div>

      {mode === "mix" ? (
        <>
          {/* Paint / Light model */}
          <div className="mt-4 flex gap-2">
            {(["paint", "light"] as Model[]).map((m) => (
              <button key={m} type="button" onClick={() => switchModel(m)} aria-pressed={model === m} className={pill(model === m)}>
                {t[m]}
              </button>
            ))}
          </div>

          {/* Pots */}
          <p className="mt-4 mb-2 text-center text-sm font-medium text-gray-500">
            {model === "light" && selected.length === 2 ? t.pickThird : t.pickTwo}
          </p>
          <div className={`grid gap-2 ${model === "paint" ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-3"}`}>
            {pots.map((p) => {
              const on = selected.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePot(p.id)}
                  aria-pressed={on}
                  aria-label={p.name[lang]}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition ${
                    on ? "border-brand bg-brand/5" : "border-gray-200 hover:-translate-y-0.5 hover:border-gray-300"
                  }`}
                >
                  <Swatch hex={p.hex} />
                  <span className="text-xs font-medium text-gray-600">{p.name[lang]}</span>
                </button>
              );
            })}
          </div>

          {/* Mixing bench */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-xl bg-gray-50 px-3 py-4">
            {selected[0] ? <Swatch hex={potById(pots, selected[0]).hex} /> : <EmptySlot />}
            <span className="text-xl font-bold text-gray-400" aria-hidden="true">+</span>
            {selected[1] ? <Swatch hex={potById(pots, selected[1]).hex} /> : <EmptySlot />}
            {model === "light" && (selected[2] || selected.length === 2) && (
              <>
                <span className="text-xl font-bold text-gray-400" aria-hidden="true">+</span>
                {selected[2] ? <Swatch hex={potById(pots, selected[2]).hex} /> : <EmptySlot />}
              </>
            )}
            {/* The slider's white/black is a real ingredient, so it appears in the
                equation and grows with the amount added. */}
            {model === "paint" && mix && tint !== 0 && (
              <>
                <span className="text-xl font-bold text-gray-400" aria-hidden="true">+</span>
                <Swatch
                  hex={tint > 0 ? "#FFFFFF" : "#1A1A1A"}
                  size={22 + Math.round(Math.abs(tint) * 26)}
                  ring={tint > 0}
                />
              </>
            )}
            <span className="text-xl font-bold text-gray-400" aria-hidden="true">=</span>
            {mix && shownHex ? (
              <span className="transition-transform duration-300" style={{ transform: "scale(1)" }}>
                <Swatch hex={shownHex} size={72} ring={mix.hex === "#FFFFFF"} />
              </span>
            ) : (
              <EmptySlot size={72} />
            )}
          </div>

          {/* Result */}
          <div aria-live="polite" className="mt-3 min-h-[3.25rem] text-center">
            {mix && mixedName ? (
              <>
                <p className="text-base font-semibold text-gray-800">
                  {t.youMade} <span className="capitalize">{mixedName}</span>
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {model === "paint" && tint !== 0 ? (tint > 0 ? t.tintExplain : t.shadeExplain) : t[mix.kind]}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">&nbsp;</p>
            )}
          </div>

          {/* Tint / shade slider (paint only) */}
          {model === "paint" && mix && (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-lg" aria-hidden="true">⚫</span>
              <label htmlFor="cm-tint" className="sr-only">
                {t.tintLabel}
              </label>
              <input
                id="cm-tint"
                type="range"
                min={-100}
                max={100}
                step={5}
                value={Math.round(tint * 100)}
                onChange={(e) => setTint(Number(e.target.value) / 100)}
                className="flex-1 accent-brand"
              />
              <span className="text-lg" aria-hidden="true">⚪</span>
              <span className="w-32 text-right text-xs font-medium text-gray-500">{tintState}</span>
            </div>
          )}

          <div className="mt-4 border-t border-gray-100 pt-4">
            <button type="button" onClick={() => { setSelected([]); setTint(0); }} className={ghost}>
              {t.clear}
            </button>
          </div>
        </>
      ) : (
        /* ---------------- Quiz ---------------- */
        <>
          <p className="mt-5 text-center text-base font-semibold text-gray-800">{question}</p>

          {/* The question, drawn with swatches */}
          <div className="mt-3 flex items-center justify-center gap-3">
            {round.type === "forward" ? (
              <>
                <Swatch hex={potById(PAINTS, qPair[0]).hex} />
                <span className="text-xl font-bold text-gray-400" aria-hidden="true">+</span>
                <Swatch hex={potById(PAINTS, qPair[1]).hex} />
                <span className="text-xl font-bold text-gray-400" aria-hidden="true">=</span>
                <EmptySlot />
              </>
            ) : (
              <>
                <EmptySlot />
                <span className="text-xl font-bold text-gray-400" aria-hidden="true">+</span>
                <EmptySlot />
                <span className="text-xl font-bold text-gray-400" aria-hidden="true">=</span>
                <Swatch hex={qMix.hex} size={56} />
              </>
            )}
          </div>

          <p
            aria-live="polite"
            className={`mt-3 min-h-[1.5rem] text-center text-sm font-medium ${
              status === "correct" ? "text-green-600" : status === "wrong" ? "text-red-500" : "text-gray-400"
            }`}
          >
            {status === "correct" ? t.correct : status === "wrong" ? t.wrong : " "}
          </p>

          {/* Answers */}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {round.options.map((optPairIdx, i) => {
              const correct = optPairIdx === round.pairIdx;
              const border =
                wrongIdx === i
                  ? "border-red-400"
                  : solved && correct
                    ? "border-green-400"
                    : "border-gray-200 hover:-translate-y-0.5 hover:border-gray-300";
              if (round.type === "forward") {
                const m = pairMix(QUIZ_PAIRS[optPairIdx]);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => answer(i)}
                    disabled={solved}
                    aria-label={m.name[lang]}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition ${border} ${solved ? "cursor-default" : ""}`}
                  >
                    <Swatch hex={m.hex} />
                    <span className="text-xs font-medium text-gray-600">{solved && correct ? m.name[lang] : " "}</span>
                  </button>
                );
              }
              const [a, b] = QUIZ_PAIRS[optPairIdx];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => answer(i)}
                  disabled={solved}
                  aria-label={`${potById(PAINTS, a).name[lang]} ${t.plus} ${potById(PAINTS, b).name[lang]}`}
                  className={`flex items-center gap-2 rounded-xl border-2 p-2 transition ${border} ${solved ? "cursor-default" : ""}`}
                >
                  <Swatch hex={potById(PAINTS, a).hex} size={40} />
                  <span className="text-base font-bold text-gray-400" aria-hidden="true">+</span>
                  <Swatch hex={potById(PAINTS, b).hex} size={40} />
                </button>
              );
            })}
          </div>

          <div className="mt-5 border-t border-gray-100 pt-4">
            <button type="button" onClick={newRound} className={ghost}>
              {t.newQ}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
