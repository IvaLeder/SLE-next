"use client";

import { useState } from "react";

type Lang = "en" | "hr";
type Variant = "shapes" | "colors" | "pics" | "letters" | "numbers";
type Pack = "animals" | "fruit" | "weather";
type Rule = "AB" | "ABC" | "AABB" | "ABB";

/** One tile in a pattern. Only the fields for its `variant` are set. */
interface Item {
  color: string;
  name: Record<Lang, string>;
  shape?: "circle" | "square" | "triangle" | "star";
  char?: string;
  emoji?: string;
}

const COPY = {
  en: {
    play: "Play: complete the pattern",
    build: "Build your own",
    variant: "Variant",
    pattern: "Pattern",
    shapes: "Shapes",
    colors: "Colors",
    pics: "Pictures",
    letters: "Letters",
    numbers: "Numbers",
    animals: "Animals",
    fruit: "Fruit",
    weather: "Weather",
    tapNext: "Tap the tile that comes next",
    correct: "That's it! The pattern continues 🎉",
    wrong: "Not quite. Look at what repeats.",
    newPattern: "🔄 New pattern",
    say: "🔊 Say it aloud",
    print: "🖨️ Print worksheet",
    clear: "✕ Clear",
    buildHint: "Tap tiles to build a repeating unit, then choose how many times it repeats.",
    repeats: "Repeats",
    unit: "Repeating unit",
    empty: "Your unit is empty. Tap the tiles above to add to it.",
    wsTitle: "Continue the pattern",
    wsIntro: "Draw or place the tile that comes next in each row.",
    wsName: "Name:",
    wsFooter: "Free printable from stemlittleexplorers.com",
  },
  hr: {
    play: "Igra: dovrši uzorak",
    build: "Složi svoj",
    variant: "Vrsta",
    pattern: "Uzorak",
    shapes: "Oblici",
    colors: "Boje",
    pics: "Sličice",
    letters: "Slova",
    numbers: "Brojevi",
    animals: "Životinje",
    fruit: "Voće",
    weather: "Vrijeme",
    tapNext: "Dodirni pločicu koja slijedi",
    correct: "Tako je! Uzorak se nastavlja 🎉",
    wrong: "Nije baš. Pogledaj što se ponavlja.",
    newPattern: "🔄 Novi uzorak",
    say: "🔊 Izgovori naglas",
    print: "🖨️ Ispiši radni list",
    clear: "✕ Očisti",
    buildHint: "Dodiruj pločice da složiš jedinicu koja se ponavlja, zatim odaberi koliko se puta ponavlja.",
    repeats: "Ponavljanja",
    unit: "Jedinica koja se ponavlja",
    empty: "Jedinica je prazna. Dodiruj pločice iznad da je popuniš.",
    wsTitle: "Nastavi uzorak",
    wsIntro: "Nacrtaj ili postavi pločicu koja slijedi u svakom redu.",
    wsName: "Ime:",
    wsFooter: "Besplatan materijal sa stemlittleexplorers.com",
  },
} as const;

// Clear, nameable colours so "say it aloud" and colour patterns make sense.
const C = {
  blue: "#378ADD",
  coral: "#D85A30",
  green: "#639922",
  purple: "#7F77DD",
  red: "#E24B4A",
  yellow: "#EF9F27",
};
const CHAR_COLORS = [C.blue, C.coral, C.green, C.purple];

const SHAPE_SVG: Record<NonNullable<Item["shape"]>, string> = {
  circle: '<circle cx="27" cy="27" r="18"/>',
  square: '<rect x="9" y="9" width="36" height="36" rx="4"/>',
  triangle: '<polygon points="27,8 46,45 8,45"/>',
  star: '<polygon points="27,6 33,21 49,21 36,31 41,47 27,37 13,47 18,31 5,21 21,21"/>',
};

const SHAPES: Item[] = [
  { shape: "circle", color: C.blue, name: { en: "circle", hr: "krug" } },
  { shape: "square", color: C.coral, name: { en: "square", hr: "kvadrat" } },
  { shape: "triangle", color: C.green, name: { en: "triangle", hr: "trokut" } },
  { shape: "star", color: C.purple, name: { en: "star", hr: "zvijezda" } },
];
const COLORS: Item[] = [
  { color: C.blue, name: { en: "blue", hr: "plava" } },
  { color: C.red, name: { en: "red", hr: "crvena" } },
  { color: C.yellow, name: { en: "yellow", hr: "žuta" } },
  { color: C.green, name: { en: "green", hr: "zelena" } },
  { color: C.purple, name: { en: "purple", hr: "ljubičasta" } },
];
const LETTERS: Item[] = ["A", "B", "C", "D"].map((ch, i) => ({
  char: ch,
  color: CHAR_COLORS[i],
  name: { en: ch, hr: ch },
}));
const NUMBERS: Item[] = ["1", "2", "3", "4"].map((ch, i) => ({
  char: ch,
  color: CHAR_COLORS[i],
  name: { en: ch, hr: ch },
}));
const emoji = (e: string, en: string, hr: string): Item => ({
  emoji: e,
  color: "#000",
  name: { en, hr },
});
const PACKS: Record<Pack, Item[]> = {
  animals: [emoji("🐶", "dog", "pas"), emoji("🐱", "cat", "mačka"), emoji("🐰", "rabbit", "zec"), emoji("🐸", "frog", "žaba")],
  fruit: [emoji("🍎", "apple", "jabuka"), emoji("🍌", "banana", "banana"), emoji("🍇", "grapes", "grožđe"), emoji("🍊", "orange", "naranča")],
  weather: [emoji("☀️", "sun", "sunce"), emoji("🌧️", "rain", "kiša"), emoji("⛅", "cloud", "oblak"), emoji("🌈", "rainbow", "duga")],
};

function elements(variant: Variant, pack: Pack): Item[] {
  switch (variant) {
    case "shapes": return SHAPES;
    case "colors": return COLORS;
    case "letters": return LETTERS;
    case "numbers": return NUMBERS;
    case "pics": return PACKS[pack];
  }
}

// The repeating "core" of each pattern, as indices into a (shuffled) element list.
const RULES: Record<Rule, number[]> = {
  AB: [0, 1],
  ABC: [0, 1, 2],
  AABB: [0, 0, 1, 1],
  ABB: [0, 1, 1],
};

// Static, no user text: safe to inject as innerHTML. Used by both the on-screen
// tiles and the print window so they render identically.
function tileMarkup(item: Item, variant: Variant, px: number): string {
  if (variant === "shapes") {
    return `<svg width="${px}" height="${px}" viewBox="0 0 54 54" fill="${item.color}" aria-hidden="true">${SHAPE_SVG[item.shape!]}</svg>`;
  }
  if (variant === "colors") {
    return `<div style="width:${px}px;height:${px}px;border-radius:10px;background:${item.color}"></div>`;
  }
  if (variant === "pics") {
    return `<div style="width:${px}px;height:${px}px;display:flex;align-items:center;justify-content:center;line-height:1;font-size:${Math.round(px * 0.6)}px">${item.emoji}</div>`;
  }
  return `<div style="width:${px}px;height:${px}px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;background:#F3F4F6;font-size:${Math.round(px * 0.5)}px;color:${item.color}">${item.char}</div>`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Game {
  seq: Item[];
  options: { item: Item; correct: boolean }[];
}

// Build one round. `rnd` is off for the very first (SSR) render so server and
// client agree on markup; the mount effect immediately rebuilds with rnd=true.
function buildGame(variant: Variant, pack: Pack, rule: Rule, rnd = true): Game {
  const pool = elements(variant, pack);
  const pal = rnd ? shuffle(pool) : [...pool];
  const core = RULES[rule];
  const distinct = Math.max(...core) + 1;
  const len = Math.min(6, core.length * (core.length <= 2 ? 3 : 2));
  const seq = Array.from({ length: len }, (_, k) => pal[core[k % core.length]]);
  const answer = seq[len - 1];
  const opts = pal.slice(0, distinct);
  if (pal[distinct] && opts.length < 4) opts.push(pal[distinct]); // one distractor
  const ordered = rnd ? shuffle(opts) : opts;
  return { seq, options: ordered.map((it) => ({ item: it, correct: it === answer })) };
}

function speak(items: Item[], lang: Lang) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(items.map((it) => it.name[lang]).join(", "));
  u.lang = lang === "hr" ? "hr-HR" : "en-US";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

function Tile({ markup }: { markup: string }) {
  return <span aria-hidden="true" style={{ lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: markup }} />;
}

export default function PatternMaker({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [mode, setMode] = useState<"play" | "build">("play");
  const [variant, setVariant] = useState<Variant>("shapes");
  const [pack, setPack] = useState<Pack>("animals");
  const [rule, setRule] = useState<Rule>("AB");

  const [game, setGame] = useState<Game>(() => buildGame("shapes", "animals", "AB", false));
  const [solved, setSolved] = useState(false);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);

  const [core, setCore] = useState<number[]>([]);
  const [reps, setReps] = useState(3);

  const buildPal = elements(variant, pack);

  // Start a fresh round. Callers pass the *new* control values explicitly so we
  // never build from stale state (and avoid a setState-in-effect round trip).
  const startGame = (v: Variant, p: Pack, r: Rule) => {
    setGame(buildGame(v, p, r));
    setSolved(false);
    setStatus("idle");
    setWrongIdx(null);
  };
  const chooseVariant = (v: Variant) => {
    setVariant(v);
    setCore([]); // element indices are meaningless once the set changes
    startGame(v, pack, rule);
  };
  const choosePack = (p: Pack) => {
    setPack(p);
    setCore([]);
    startGame(variant, p, rule);
  };
  const chooseRule = (r: Rule) => {
    setRule(r);
    startGame(variant, pack, r);
  };

  const pick = (i: number) => {
    if (solved) return;
    if (game.options[i].correct) {
      setSolved(true);
      setStatus("correct");
    } else {
      setStatus("wrong");
      setWrongIdx(i);
      setTimeout(() => setWrongIdx(null), 600);
    }
  };

  const printWorksheet = () => {
    const w = window.open("", "_blank", "width=820,height=1060");
    if (!w) return;
    const cols = 8;
    const px = 46;
    const rows = (["AB", "ABC", "AABB", "ABB", "AB", "ABC"] as Rule[])
      .map((r) => {
        const pal = shuffle(elements(variant, pack));
        const core = RULES[r];
        const show = Math.min(cols - 3, core.length * 2); // ~2 cycles, then blanks
        const cells = Array.from({ length: cols }, (_, c) =>
          c < show
            ? tileMarkup(pal[core[c % core.length]], variant, px)
            : `<div style="width:${px}px;height:${px}px;border-radius:10px;border:2px dashed #bbb"></div>`
        );
        return `<div style="display:flex;gap:10px;margin:14px 0">${cells.join("")}</div>`;
      })
      .join("");
    w.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${t.wsTitle}</title>` +
        `<style>*{box-sizing:border-box}body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#111;margin:40px}` +
        `h1{font-size:26px;margin:0 0 4px}p{color:#444;margin:0 0 18px}.name{margin:0 0 24px;font-size:15px}` +
        `.foot{margin-top:36px;color:#888;font-size:12px;border-top:1px solid #ddd;padding-top:8px}@page{margin:16mm}</style>` +
        `</head><body><h1>${t.wsTitle}</h1><p>${t.wsIntro}</p>` +
        `<div class="name">${t.wsName} ______________________</div>${rows}` +
        `<div class="foot">${t.wsFooter}</div></body></html>`
    );
    w.document.close();
    w.focus();
    const go = () => {
      try { w.print(); } catch { /* user closed it */ }
    };
    if (w.document.readyState === "complete") setTimeout(go, 300);
    else w.onload = () => setTimeout(go, 300);
  };

  const pill = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      active ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;
  const ghost =
    "inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200";

  const lastIdx = game.seq.length - 1;
  const ariaSeq = game.seq
    .map((it, i) => (i === lastIdx && !solved ? "?" : it.name[lang]))
    .join(", ");
  const buildSeq = Array.from({ length: core.length * reps }, (_, k) => buildPal[core[k % core.length]]);

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      {/* Mode */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("play")} aria-pressed={mode === "play"} className={`flex-1 ${pill(mode === "play")}`}>
          {t.play}
        </button>
        <button type="button" onClick={() => setMode("build")} aria-pressed={mode === "build"} className={`flex-1 ${pill(mode === "build")}`}>
          {t.build}
        </button>
      </div>

      {/* Variant */}
      <p className="mt-5 mb-1 text-sm font-medium text-gray-500">{t.variant}</p>
      <div className="flex flex-wrap gap-2">
        {(["shapes", "colors", "pics", "letters", "numbers"] as Variant[]).map((v) => (
          <button key={v} type="button" onClick={() => chooseVariant(v)} aria-pressed={variant === v} className={pill(variant === v)}>
            {t[v]}
          </button>
        ))}
      </div>

      {/* Picture pack (only for pictures) */}
      {variant === "pics" && (
        <div className="mt-2 flex flex-wrap gap-2">
          {(["animals", "fruit", "weather"] as Pack[]).map((p) => (
            <button key={p} type="button" onClick={() => choosePack(p)} aria-pressed={pack === p} className={pill(pack === p)}>
              {t[p]}
            </button>
          ))}
        </div>
      )}

      {/* Rule (play only) */}
      {mode === "play" && (
        <>
          <p className="mt-4 mb-1 text-sm font-medium text-gray-500">{t.pattern}</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(RULES) as Rule[]).map((r) => (
              <button key={r} type="button" onClick={() => chooseRule(r)} aria-pressed={rule === r} className={pill(rule === r)}>
                {r.split("").join(" ")}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Play area */}
      {mode === "play" ? (
        <>
          <div role="img" aria-label={ariaSeq} className="mt-5 flex flex-wrap items-center justify-center gap-2 py-3">
            {game.seq.map((it, i) =>
              i === lastIdx && !solved ? (
                <span
                  key={i}
                  className="flex h-[54px] w-[54px] items-center justify-center rounded-[10px] border-2 border-dashed border-gray-300 text-2xl text-gray-400"
                  aria-hidden="true"
                >
                  ?
                </span>
              ) : (
                <Tile key={i} markup={tileMarkup(it, variant, 54)} />
              )
            )}
          </div>

          <p
            className={`min-h-[1.5rem] text-center text-sm font-medium ${
              status === "correct" ? "text-green-600" : status === "wrong" ? "text-red-500" : "text-gray-400"
            }`}
          >
            {status === "correct" ? t.correct : status === "wrong" ? t.wrong : t.tapNext}
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {game.options.map((o, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                disabled={solved}
                aria-label={o.item.name[lang]}
                className={`rounded-xl border-2 p-1 transition ${
                  wrongIdx === i
                    ? "border-red-400"
                    : solved && o.correct
                      ? "border-green-400"
                      : "border-gray-200 hover:-translate-y-0.5 hover:border-gray-300"
                } ${solved ? "cursor-default" : ""}`}
              >
                <Tile markup={tileMarkup(o.item, variant, 54)} />
              </button>
            ))}
          </div>
        </>
      ) : (
        /* Build area */
        <>
          <p className="mt-4 text-sm text-gray-500">{t.buildHint}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {buildPal.map((it, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCore((c) => (c.length >= 6 ? c : [...c, i]))}
                aria-label={it.name[lang]}
                className="rounded-xl border-2 border-gray-200 p-1 transition hover:-translate-y-0.5 hover:border-gray-300"
              >
                <Tile markup={tileMarkup(it, variant, 48)} />
              </button>
            ))}
          </div>

          <p className="mt-4 mb-1 text-sm font-medium text-gray-500">{t.unit}</p>
          {core.length === 0 ? (
            <p className="text-sm text-gray-400">{t.empty}</p>
          ) : (
            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-gray-50 p-2">
              {core.map((idx, k) => (
                <Tile key={k} markup={tileMarkup(buildPal[idx], variant, 40)} />
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <label htmlFor="pm-reps" className="text-sm font-medium text-gray-500">
              {t.repeats}
            </label>
            <input
              id="pm-reps"
              type="range"
              min={2}
              max={6}
              step={1}
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className="flex-1 accent-brand"
            />
            <span className="w-6 text-sm font-semibold text-gray-700">{reps}</span>
          </div>

          {core.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-gray-100 py-3">
              {buildSeq.map((it, k) => (
                <Tile key={k} markup={tileMarkup(it, variant, 48)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
        {mode === "play" ? (
          <button type="button" onClick={() => startGame(variant, pack, rule)} className={ghost}>
            {t.newPattern}
          </button>
        ) : (
          <button type="button" onClick={() => setCore([])} className={ghost}>
            {t.clear}
          </button>
        )}
        <button
          type="button"
          onClick={() => speak(mode === "play" ? game.seq : core.map((i) => buildPal[i]), lang)}
          className={ghost}
        >
          {t.say}
        </button>
        <button type="button" onClick={printWorksheet} className={ghost}>
          {t.print}
        </button>
      </div>
    </div>
  );
}
