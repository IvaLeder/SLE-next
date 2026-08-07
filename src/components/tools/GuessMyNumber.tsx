"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Lang = "en" | "hr";
type Tab = "mine" | "yours" | "why";

/** Ranges the game offers. With a confirmed final guess, q questions cover
 *  at most 2^q - 1 values: 7 for 100 and 10 for 1000. */
const RANGES = [100, 1000] as const;
type Range = (typeof RANGES)[number];

const questionsFor = (size: number) => Math.ceil(Math.log2(size + 1));

const COPY = {
  en: {
    tabMine: "I guess your number",
    tabYours: "You guess mine",
    tabWhy: "Why 7 is enough",

    range: "Numbers from 1 to",
    restart: "Play again",
    questions: "Questions used",
    of: "of",
    stillPossible: (k: number) => `${k} numbers still possible`,
    onePossible: "Only one number left",

    /* mine — the tool guesses */
    mineIntro:
      "Think of a number and keep it secret. Answer honestly and watch how few questions it takes.",
    ready: "I have a number in my head",
    myGuess: "Is your number",
    higher: "Higher ↑",
    lower: "Lower ↓",
    thatsIt: "That's it! 🎉",
    mustBe: (n: number) => `Is your number ${n}?`,
    iWin: (n: number, q: number) => `Found it: ${n}, in ${q} questions.`,
    iWinWhy: (q: number, size: number) =>
      `Every wrong answer left at most half the previous range. That is why ${questionsFor(size)} questions are always enough for 1 to ${size}, and I needed ${q}.`,
    cheated: "Hmm, those answers cannot both be true. Did the number move? 😉",
    halved: "Largest range that can remain after each wrong guess:",

    /* yours — the kid guesses */
    yoursIntro:
      "I picked a secret number. Guess it, and I will tell you whether to go higher or lower.",
    yourGuess: "Your guess",
    go: "Guess",
    tooLow: "Higher ↑",
    tooHigh: "Lower ↓",
    outOfRange: (size: number) => `Pick a number from 1 to ${size}.`,
    already: "You already tried that one.",
    youWin: (n: number, q: number) => `Yes! It was ${n}, and you found it in ${q} guesses.`,
    perfect: "Every single guess landed in the middle of what was left. That is binary search, played perfectly.",
    good: (best: number) => `The fewest possible in the worst case is ${best}. Very close.`,
    canDoBetter: (best: number) =>
      `You can always do it in ${best} or fewer: each guess should split what is left in half.`,
    middleWas: (n: number) => `middle was ${n}`,
    smart: "split it in half",
    history: "Your guesses",
    newSecret: "New secret number",
    reveal: "Give up and show me",
    revealed: (n: number) => `The number was ${n}.`,

    /* why */
    whyIntro:
      "Halving is deceptively powerful. Each extra question roughly doubles the size of the pile you can search, so the pile grows explosively while the questions creep up one at a time.",
    qCol: "Questions",
    canFindCol: "Biggest pile you can search",
    tableNote:
      "With a confirmed final guess, q questions cover 2^q - 1 numbers. Ten questions cover 1,023 numbers and twenty cover 1,048,575.",
    walk: "Watch 100 numbers disappear",
    walkNote:
      "After six wrong guesses, at most one of the original 100 numbers remains; question seven confirms it. Ten questions can identify any number from 1 to 1000.",
    barCaption: "Numbers left after each question",
    tryRange: "How many questions for",
    answerIs: (q: number) => `${q} questions`,
  },
  hr: {
    tabMine: "Ja pogađam tvoj broj",
    tabYours: "Ti pogađaš moj",
    tabWhy: "Zašto je 7 dovoljno",

    range: "Brojevi od 1 do",
    restart: "Igraj ponovno",
    questions: "Iskorišteno pitanja",
    of: "od",
    stillPossible: (k: number) => `Još je moguće ${k} brojeva`,
    onePossible: "Ostao je samo jedan broj",

    mineIntro:
      "Zamisli broj i drži ga u tajnosti. Odgovaraj iskreno i gledaj koliko malo pitanja treba.",
    ready: "Zamislio sam broj",
    myGuess: "Je li tvoj broj",
    higher: "Veći ↑",
    lower: "Manji ↓",
    thatsIt: "To je taj! 🎉",
    mustBe: (n: number) => `Je li tvoj broj ${n}?`,
    iWin: (n: number, q: number) => `Našao sam: ${n}, u ${q} pitanja.`,
    iWinWhy: (q: number, size: number) =>
      `Nakon svakog pogrešnog pokušaja ostalo je najviše pola prethodnog raspona. Zato je ${questionsFor(size)} pitanja uvijek dovoljno za brojeve od 1 do ${size}, a meni je trebalo ${q}.`,
    cheated: "Hmm, ta dva odgovora ne mogu oba biti istinita. Je li se broj pomaknuo? 😉",
    halved: "Najveći raspon koji može ostati nakon svakog pogrešnog pokušaja:",

    yoursIntro:
      "Zamislio sam tajni broj. Pogodi ga, a ja ću ti reći treba li ići gore ili dolje.",
    yourGuess: "Tvoj pokušaj",
    go: "Pogodi",
    tooLow: "Veći ↑",
    tooHigh: "Manji ↓",
    outOfRange: (size: number) => `Odaberi broj od 1 do ${size}.`,
    already: "To si već probao.",
    youWin: (n: number, q: number) => `Da! Bio je ${n}, a ti si ga našao u ${q} pokušaja.`,
    perfect:
      "Svaki pokušaj pao je točno u sredinu onoga što je ostalo. To je binarno traženje, odigrano savršeno.",
    good: (best: number) => `Najmanje moguće u najgorem slučaju je ${best}. Vrlo blizu.`,
    canDoBetter: (best: number) =>
      `Uvijek se može u ${best} pokušaja ili manje: svaki pokušaj treba prepoloviti ono što je ostalo.`,
    middleWas: (n: number) => `sredina je bila ${n}`,
    smart: "prepolovljeno",
    history: "Tvoji pokušaji",
    newSecret: "Novi tajni broj",
    reveal: "Predaj se i pokaži",
    revealed: (n: number) => `Broj je bio ${n}.`,

    whyIntro:
      "Polovljenje je jače nego što se čini. Svako dodatno pitanje otprilike udvostruči gomilu koju možeš pretražiti, pa gomila raste eksplozivno, a broj pitanja povećava se jedno po jedno.",
    qCol: "Pitanja",
    canFindCol: "Najveća gomila koju možeš pretražiti",
    tableNote:
      "Kad posljednji broj morate potvrditi, q pitanja pokriva 2^q - 1 brojeva. Deset pitanja pokriva 1.023 broja, a dvadeset 1.048.575.",
    walk: "Gledaj kako 100 brojeva nestaje",
    walkNote:
      "Nakon šest pogrešnih pokušaja može ostati najviše jedan od početnih 100 brojeva; sedmo pitanje ga potvrđuje. Deset pitanja može pronaći bilo koji broj od 1 do 1000.",
    barCaption: "Koliko brojeva ostaje nakon svakog pitanja",
    tryRange: "Koliko pitanja za",
    answerIs: (q: number) => `${q} pitanja`,
  },
} as const;

/** Module scope on purpose: drawing the secret is impure, so it must not sit
 *  in the component body where it could be mistaken for render work. */
function drawSecret(size: number): number {
  return 1 + Math.floor(Math.random() * size);
}

/** A wrong midpoint guess is removed too, so at most floor(k / 2)
 *  candidates survive: 100 → 50 → 25 → 12 → 6 → 3 → 1. */
function worstCaseRemainders(size: number): number[] {
  const out = [size];
  let k = size;
  while (k > 1) {
    k = Math.floor(k / 2);
    out.push(k);
  }
  return out;
}

export default function GuessMyNumber({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [tab, setTab] = useState<Tab>("mine");
  const [size, setSize] = useState<Range>(100);
  const best = questionsFor(size);

  /* ── mode "mine": the tool narrows down the kid's number ─────────────── */
  const [lo, setLo] = useState(1);
  const [hi, setHi] = useState(100);
  const [asked, setAsked] = useState(0);
  const [found, setFound] = useState<number | null>(null);
  const [broken, setBroken] = useState(false);

  const guess = Math.floor((lo + hi) / 2);
  const possible = hi - lo + 1;

  const resetMine = (newSize: Range = size) => {
    setLo(1);
    setHi(newSize);
    setAsked(0);
    setFound(null);
    setBroken(false);
  };

  const say = (dir: "higher" | "lower") => {
    setAsked((a) => a + 1);
    if (dir === "higher") {
      if (guess + 1 > hi) return setBroken(true);
      setLo(guess + 1);
    } else {
      if (guess - 1 < lo) return setBroken(true);
      setHi(guess - 1);
    }
  };

  /* ── mode "yours": the kid narrows down the tool's number ────────────── */
  const [secret, setSecret] = useState(0);
  const [entry, setEntry] = useState("");
  const [tries, setTries] = useState<{ n: number; dir: "up" | "down" | "hit"; mid: number }[]>([]);
  const [note, setNote] = useState("");
  const [gaveUp, setGaveUp] = useState(false);
  const seeded = useRef(false);

  /* The secret is drawn on the client: a random value during render would not
   * match the server HTML and would trip a hydration mismatch. */
  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      setSecret(drawSecret(100));
    }
  }, []);

  const newSecret = (newSize: Range = size) => {
    setSecret(drawSecret(newSize));
    setTries([]);
    setEntry("");
    setNote("");
    setGaveUp(false);
  };

  /* The range the kid could have deduced from their own answers so far. */
  const deduced = useMemo(() => {
    let l: number = 1;
    let h: number = size;
    for (const tr of tries) {
      if (tr.dir === "up") l = Math.max(l, tr.n + 1);
      if (tr.dir === "down") h = Math.min(h, tr.n - 1);
    }
    return { lo: l, hi: h };
  }, [tries, size]);

  const won = tries.some((tr) => tr.dir === "hit");

  const submitGuess = () => {
    if (won || gaveUp) return;
    const g = Number.parseInt(entry, 10);
    if (!Number.isFinite(g) || g < 1 || g > size) {
      setNote(t.outOfRange(size));
      return;
    }
    if (tries.some((tr) => tr.n === g)) {
      setNote(t.already);
      return;
    }
    const mid = Math.floor((deduced.lo + deduced.hi) / 2);
    const dir = g === secret ? "hit" : g < secret ? "up" : "down";
    setTries((prev) => [...prev, { n: g, dir, mid }]);
    setEntry("");
    setNote("");
  };

  /* Reset both games when the range changes, so no state outlives its bounds. */
  const changeSize = (next: Range) => {
    setSize(next);
    resetMine(next);
    newSecret(next);
  };

  /* ───────────────────────────── shared bits ─────────────────────────── */

  const chip = (active: boolean, label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 font-sans text-sm font-semibold transition-colors ${
        active ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  const rangePicker = (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-gray-500">{t.range}</span>
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => changeSize(r)}
          aria-pressed={size === r}
          className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
            size === r ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {r.toLocaleString(lang === "hr" ? "hr-HR" : "en-US")}
        </button>
      ))}
    </div>
  );

  /** The shrinking window, drawn as a bar over the whole range. */
  const bar = (l: number, h: number, marker?: number) => (
    <div className="relative mt-3 h-8 overflow-hidden rounded-lg bg-gray-100">
      <div
        className="absolute inset-y-0 bg-indigo-200"
        style={{ left: `${((l - 1) / size) * 100}%`, width: `${((h - l + 1) / size) * 100}%` }}
      />
      {marker !== undefined && (
        <div
          className="absolute inset-y-0 w-[2px] bg-indigo-700"
          style={{ left: `${((marker - 0.5) / size) * 100}%` }}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-between px-2 font-mono text-xs font-semibold text-gray-500">
        <span>{l}</span>
        <span>{h}</span>
      </div>
    </div>
  );

  const counter = (used: number) => (
    <p className="mt-3 text-sm text-gray-500">
      {t.questions}:{" "}
      <b className={used > best ? "text-orange-700" : "text-gray-800"}>{used}</b>{" "}
      <span className="text-gray-400">
        {t.of} {best}
      </span>
    </p>
  );

  /* ───────────────────────────── mode "mine" ─────────────────────────── */

  const mineTab = (
    <div>
      <p className="text-sm leading-relaxed text-gray-600">{t.mineIntro}</p>
      <div className="mt-4">{rangePicker}</div>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-6 text-center">
        {broken ? (
          <>
            <p className="text-lg font-bold text-orange-700">🤨 {t.cheated}</p>
            <button
              type="button"
              onClick={() => resetMine()}
              className="mt-4 rounded-full bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              ↺ {t.restart}
            </button>
          </>
        ) : found !== null ? (
          <>
            <p className="text-lg font-bold text-emerald-700" aria-live="polite">
              🎉 {t.iWin(found, asked)}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600">
              {t.iWinWhy(asked, size)}
            </p>
            <button
              type="button"
              onClick={() => resetMine()}
              className="mt-4 rounded-full bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              ↺ {t.restart}
            </button>
          </>
        ) : lo === hi ? (
          <>
            <p className="font-sans text-lg text-gray-600">{t.mustBe(lo)}</p>
            <p className="mt-1 text-5xl font-extrabold text-indigo-700">{lo}</p>
            <button
              type="button"
              onClick={() => {
                setFound(lo);
                setAsked((a) => a + 1);
              }}
              className="mt-5 rounded-full bg-emerald-600 px-6 py-2.5 font-semibold text-white hover:bg-emerald-700"
            >
              {t.thatsIt}
            </button>
          </>
        ) : (
          <>
            <p className="font-sans text-lg text-gray-600">{t.myGuess}</p>
            <p className="mt-1 text-5xl font-extrabold text-indigo-700">{guess}?</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => say("higher")}
                className="rounded-full bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
              >
                {t.higher}
              </button>
              <button
                type="button"
                onClick={() => say("lower")}
                className="rounded-full bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
              >
                {t.lower}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFound(guess);
                  setAsked((a) => a + 1);
                }}
                className="rounded-full bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700"
              >
                {t.thatsIt}
              </button>
            </div>
          </>
        )}
      </div>

      {!broken && found === null && (
        <>
          {bar(lo, hi, guess)}
          <p className="mt-2 text-sm text-gray-500">
            {possible === 1 ? t.onePossible : t.stillPossible(possible)}
          </p>
        </>
      )}
      {counter(asked)}

      <p className="mt-4 text-xs font-medium text-gray-500">{t.halved}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {worstCaseRemainders(size).map((k, i) => (
          <span
            key={i}
            className={`rounded-md px-2 py-1 font-mono text-xs font-semibold ${
              i <= asked ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-400"
            }`}
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  );

  /* ──────────────────────────── mode "yours" ─────────────────────────── */

  const midHits = tries.filter((tr) => Math.abs(tr.n - tr.mid) <= 1).length;
  const yoursTab = (
    <div>
      <p className="text-sm leading-relaxed text-gray-600">{t.yoursIntro}</p>
      <div className="mt-4">{rangePicker}</div>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-6">
        {won ? (
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-700" aria-live="polite">
              🎉 {t.youWin(secret, tries.length)}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600">
              {midHits === tries.length
                ? t.perfect
                : tries.length <= best
                  ? t.good(best)
                  : t.canDoBetter(best)}
            </p>
          </div>
        ) : gaveUp ? (
          <p className="text-center text-lg font-bold text-gray-700">{t.revealed(secret)}</p>
        ) : (
          <div className="flex flex-wrap items-end justify-center gap-3">
            <div>
              <label
                htmlFor="gmn-guess"
                className="block text-sm font-medium text-gray-600"
              >
                {t.yourGuess}
              </label>
              <input
                id="gmn-guess"
                type="text"
                inputMode="numeric"
                value={entry}
                onChange={(e) => setEntry(e.target.value.replace(/\D/g, "").slice(0, 4))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitGuess();
                }}
                className="mt-1 w-28 rounded-lg border border-gray-300 px-3 py-2 font-mono text-xl focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <button
              type="button"
              onClick={submitGuess}
              className="rounded-full bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              {t.go}
            </button>
          </div>
        )}

        {note && <p className="mt-3 text-center text-sm font-medium text-orange-700">{note}</p>}
      </div>

      {tries.length > 0 && (
        <>
          <p className="mt-4 text-xs font-medium text-gray-500">{t.history}</p>
          <ol className="mt-2 space-y-1.5">
            {tries.map((tr, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="w-6 text-right font-mono text-xs text-gray-400">{i + 1}.</span>
                <span className="w-12 font-mono text-base font-bold text-gray-800">{tr.n}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    tr.dir === "hit"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tr.dir === "hit" ? "🎯" : tr.dir === "up" ? t.tooLow : t.tooHigh}
                </span>
                {Math.abs(tr.n - tr.mid) <= 1 ? (
                  <span className="text-xs font-medium text-indigo-600">✓ {t.smart}</span>
                ) : (
                  <span className="text-xs text-gray-400">({t.middleWas(tr.mid)})</span>
                )}
              </li>
            ))}
          </ol>
        </>
      )}

      {!won && !gaveUp && tries.length > 0 && (
        <>
          {bar(deduced.lo, deduced.hi)}
          <p className="mt-2 text-sm text-gray-500">
            {deduced.hi - deduced.lo + 1 === 1
              ? t.onePossible
              : t.stillPossible(deduced.hi - deduced.lo + 1)}
          </p>
        </>
      )}
      {counter(tries.length)}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => newSecret()}
          className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
        >
          ↺ {t.newSecret}
        </button>
        {!won && !gaveUp && tries.length > 0 && (
          <button
            type="button"
            onClick={() => setGaveUp(true)}
            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-400 underline hover:text-gray-600"
          >
            {t.reveal}
          </button>
        )}
      </div>
    </div>
  );

  /* ───────────────────────────── mode "why" ──────────────────────────── */

  const whyRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20];
  const whyTab = (
    <div>
      <p className="text-sm leading-relaxed text-gray-600">{t.whyIntro}</p>

      <p className="mt-5 text-sm font-semibold text-gray-700">{t.walk}</p>
      <div className="mt-2 flex flex-wrap items-end gap-1.5">
        {worstCaseRemainders(100).map((k, i) => (
          <div key={i} className="text-center">
            <div
              className="mx-auto w-6 rounded-t bg-indigo-500 sm:w-8"
              style={{ height: `${Math.max(4, (k / 100) * 90)}px` }}
            />
            <div className="mt-1 font-mono text-[11px] font-semibold text-gray-600">{k}</div>
            <div className="text-[10px] text-gray-400">{i === 0 ? "" : i}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-gray-400">{t.barCaption}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{t.walkNote}</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[18rem] text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="py-2 pr-4 font-semibold">{t.qCol}</th>
              <th className="py-2 font-semibold">{t.canFindCol}</th>
            </tr>
          </thead>
          <tbody>
            {whyRows.map((q) => {
              const covers = 2 ** q - 1;
              const isSeven = q === 7;
              const isTen = q === 10;
              return (
                <tr
                  key={q}
                  className={`border-b border-gray-100 ${
                    isSeven || isTen ? "bg-amber-50 font-semibold text-amber-900" : "text-gray-700"
                  }`}
                >
                  <td className="py-1.5 pr-4 font-mono">{q}</td>
                  <td className="py-1.5 font-mono">
                    {covers.toLocaleString(lang === "hr" ? "hr-HR" : "en-US")}
                    {isSeven && <span className="ml-2 font-sans text-xs">← 1 … 100</span>}
                    {isTen && <span className="ml-2 font-sans text-xs">← 1 … 1000</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{t.tableNote}</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-500">{t.tryRange}</span>
        {[100, 1000, 10000, 1000000].map((r) => (
          <span
            key={r}
            className="rounded-lg bg-indigo-50 px-3 py-1 font-mono text-sm font-semibold text-indigo-800"
          >
            {r.toLocaleString(lang === "hr" ? "hr-HR" : "en-US")} → {t.answerIs(questionsFor(r))}
          </span>
        ))}
      </div>
    </div>
  );

  /* ──────────────────────────────── shell ───────────────────────────── */

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <div className="flex flex-wrap gap-2">
        {chip(tab === "mine", t.tabMine, () => setTab("mine"))}
        {chip(tab === "yours", t.tabYours, () => setTab("yours"))}
        {chip(tab === "why", t.tabWhy, () => setTab("why"))}
      </div>

      <div className="mt-5">{tab === "mine" ? mineTab : tab === "yours" ? yoursTab : whyTab}</div>
    </div>
  );
}
