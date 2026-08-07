"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Lang = "en" | "hr";
type Tab = "sieve" | "rect" | "quiz";

const MAX = 100;
/** The sieve rounds for 1..100: after 7, everything left standing is prime
 *  (the next prime is 11 and 11 × 11 = 121, already past 100). */
const ROUNDS = [2, 3, 5, 7] as const;
type Round = (typeof ROUNDS)[number];

const STORE_BEST = "prime-explorer:best";

/** One colour per sieve round. A number keeps the colour of the FIRST round
 *  that crossed it out, which is also its smallest prime factor. */
const ROUND_COLOR: Record<Round, { dot: string; cell: string; text: string }> = {
  2: { dot: "#378ADD", cell: "bg-sky-50 border-sky-200", text: "text-sky-700" },
  3: { dot: "#D85A30", cell: "bg-orange-50 border-orange-200", text: "text-orange-700" },
  5: { dot: "#639922", cell: "bg-lime-50 border-lime-200", text: "text-lime-700" },
  7: { dot: "#8B5CF6", cell: "bg-violet-50 border-violet-200", text: "text-violet-700" },
};

const COPY = {
  en: {
    tabSieve: "Cross them out",
    tabRect: "Make rectangles",
    tabQuiz: "Prime or not?",

    /* sieve */
    sieveIntro:
      "Every number from 1 to 100. Cross out the multiples one prime at a time and see what survives.",
    crossOut: (n: number) => `Cross out multiples of ${n}`,
    crossOne: "Cross out 1",
    oneWhy: "One is not a prime: it has only one divisor, itself.",
    reveal: "Show what is left",
    startOver: "Start over",
    keepGoing: "Next step",
    legend: "Crossed out by",
    stillStanding: "Still standing",
    crossedOut: "Crossed out",
    doneTitle: "The 25 numbers still standing are the primes.",
    doneBody:
      "Each one has exactly two divisors: 1 and itself. Everything you crossed out can be split into equal rows, so it is composite.",
    whyStop: "Why stop at 7?",
    whyStopBody:
      "The next prime is 11, and 11 × 11 = 121, which is already past 100. Any composite number under 100 must have a factor of 2, 3, 5 or 7, so by now they are all gone.",
    firstFactor: (n: number, p: number) => `${n} was crossed out by ${p}. Its smallest factor is ${p}.`,
    tapHint: "Tap any number to see its rectangles.",
    stepOf: (i: number, total: number) => `Step ${i} of ${total}`,
    keepsColor: "A number keeps the colour of the first prime that crossed it out.",

    /* rectangles */
    rectIntro:
      "Try to build a rectangle out of this many dots. A number that can only make one long line is prime.",
    numberLabel: "Number",
    tryThese: "Try these:",
    rectPrime: (n: number) => `${n} is PRIME.`,
    rectPrimeWhy: (n: number) =>
      `One line of ${n} dots is the only rectangle you can make. There is no way to share ${n} dots into equal rows, so its only divisors are 1 and ${n}.`,
    rectComposite: (n: number, k: number) => `${n} is composite: ${k} different rectangles.`,
    rectCompositeWhy: (n: number) =>
      `Because those rows come out even, ${n} can be split up. That is exactly what composite means.`,
    rectOne: "1 is neither prime nor composite.",
    rectOneWhy:
      "A prime needs exactly two divisors, and 1 has only one: itself. Mathematicians agreed to leave it out of both clubs.",
    rectTwo: "2 is the only even prime.",
    rectTwoWhy:
      "Every other even number can be shared into two equal rows, which makes it composite.",
    divisors: "Divisors",
    rectLabel: (a: number, b: number) => `${a} × ${b}`,
    square: "a perfect square",

    /* quiz */
    quizIntro: "Is this number prime? Even numbers are the easy ones, so we mostly ask the odd ones.",
    isItPrime: (n: number) => `Is ${n} prime?`,
    yesPrime: "Prime",
    notPrime: "Not prime",
    right: "Right!",
    nope: "Not quite.",
    becausePrime: (n: number) => `${n} is prime. Nothing divides it except 1 and ${n}.`,
    becauseComposite: (n: number, a: number, b: number) => `${n} is not prime, because ${a} × ${b} = ${n}.`,
    next: "Next number",
    score: "Score",
    streak: "Streak",
    best: "Best streak",
    hint: "Hint: try dividing by 3, then 7, then 11. If none of them fit, it is prime.",
    showRect: "Show me the rectangles",
    reset: "Reset score",

    /* a11y */
    a11yCrossed: (n: number, p: number) => `${n}, crossed out as a multiple of ${p}`,
    a11yPrime: (n: number) => `${n}, prime`,
    a11yOpen: (n: number) => `Look at ${n} in the rectangles`,
  },
  hr: {
    tabSieve: "Prekriži ih",
    tabRect: "Složi pravokutnike",
    tabQuiz: "Prost ili nije?",

    sieveIntro:
      "Svi brojevi od 1 do 100. Prekriži višekratnike jednog prostog broja za drugim i vidi što ostane.",
    crossOut: (n: number) => `Prekriži višekratnike broja ${n}`,
    crossOne: "Prekriži 1",
    oneWhy: "Jedan nije prost broj: ima samo jedan djelitelj, sebe.",
    reveal: "Pokaži što je ostalo",
    startOver: "Počni ispočetka",
    keepGoing: "Sljedeći korak",
    legend: "Prekrižio ih je",
    stillStanding: "Još stoji",
    crossedOut: "Prekriženo",
    doneTitle: "Onih 25 brojeva koji su ostali su prosti brojevi.",
    doneBody:
      "Svaki od njih ima točno dva djelitelja: 1 i sebe. Sve što si prekrižio može se podijeliti u jednake redove, pa je složeno.",
    whyStop: "Zašto stajemo na 7?",
    whyStopBody:
      "Sljedeći prosti broj je 11, a 11 × 11 = 121, što je već prešlo 100. Svaki složeni broj manji od 100 mora imati faktor 2, 3, 5 ili 7, pa su do sada svi nestali.",
    firstFactor: (n: number, p: number) =>
      `Broj ${n} prekrižio je ${p}. Njegov najmanji faktor je ${p}.`,
    tapHint: "Dotakni bilo koji broj da vidiš njegove pravokutnike.",
    stepOf: (i: number, total: number) => `Korak ${i} od ${total}`,
    keepsColor: "Broj zadržava boju prvog prostog broja koji ga je prekrižio.",

    rectIntro:
      "Pokušaj složiti pravokutnik od ovoliko točkica. Broj od kojeg se može složiti samo jedan dugi red je prost.",
    numberLabel: "Broj",
    tryThese: "Isprobaj:",
    rectPrime: (n: number) => `${n} je PROST broj.`,
    rectPrimeWhy: (n: number) =>
      `Jedan red od ${n} točkica jedini je pravokutnik koji možeš složiti. Nema načina da se ${n} točkica rasporedi u jednake redove, pa su mu jedini djelitelji 1 i ${n}.`,
    rectComposite: (n: number, k: number) => `${n} je složen broj: ${k} različita pravokutnika.`,
    rectCompositeWhy: (n: number) =>
      `Budući da ti redovi izlaze na jednako, ${n} se može rastaviti. Upravo to znači složen broj.`,
    rectOne: "1 nije ni prost ni složen broj.",
    rectOneWhy:
      "Prost broj mora imati točno dva djelitelja, a 1 ima samo jedan: sebe. Matematičari su se dogovorili da ga ostave izvan oba kluba.",
    rectTwo: "2 je jedini parni prosti broj.",
    rectTwoWhy:
      "Svaki drugi parni broj može se podijeliti u dva jednaka reda, što ga čini složenim.",
    divisors: "Djelitelji",
    rectLabel: (a: number, b: number) => `${a} × ${b}`,
    square: "potpuni kvadrat",

    quizIntro:
      "Je li ovaj broj prost? Parni su lagani, pa najčešće pitamo za neparne.",
    isItPrime: (n: number) => `Je li ${n} prost broj?`,
    yesPrime: "Prost je",
    notPrime: "Nije prost",
    right: "Točno!",
    nope: "Nije baš.",
    becausePrime: (n: number) => `${n} je prost broj. Ništa ga ne dijeli osim 1 i ${n}.`,
    becauseComposite: (n: number, a: number, b: number) =>
      `${n} nije prost broj, jer je ${a} × ${b} = ${n}.`,
    next: "Sljedeći broj",
    score: "Rezultat",
    streak: "Niz",
    best: "Najbolji niz",
    hint: "Pomoć: pokušaj podijeliti s 3, pa sa 7, pa s 11. Ako nijedan ne stane, broj je prost.",
    showRect: "Pokaži mi pravokutnike",
    reset: "Obriši rezultat",

    a11yCrossed: (n: number, p: number) => `${n}, prekrižen kao višekratnik broja ${p}`,
    a11yPrime: (n: number) => `${n}, prost broj`,
    a11yOpen: (n: number) => `Pogledaj ${n} u pravokutnicima`,
  },
} as const;

/* ─────────────────────────────── number facts ────────────────────────────── */

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** Smallest prime factor, or null for 1 and the primes themselves. */
function smallestFactor(n: number): number | null {
  if (n < 4) return null;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return d;
  return null;
}

/** Divisor pairs a × b with a ≤ b, smallest a first. */
function pairs(n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let a = 1; a * a <= n; a++) if (n % a === 0) out.push([a, n / a]);
  return out;
}

function divisorsOf(n: number): number[] {
  const out: number[] = [];
  for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d);
  return out;
}

/** Which round crossed each number out: index = number, value = the prime. */
const CROSSED_BY: (Round | null)[] = (() => {
  const by: (Round | null)[] = Array(MAX + 1).fill(null);
  for (const p of ROUNDS) {
    for (let n = p * 2; n <= MAX; n += p) if (by[n] === null) by[n] = p;
  }
  return by;
})();

/** Quiz pool: 2 plus every odd number 3..99, so "it's even" is never the answer. */
const QUIZ_POOL = [2, ...Array.from({ length: 49 }, (_, i) => i * 2 + 3)];

/* ──────────────────────────────── the tool ───────────────────────────────── */

export default function PrimeExplorer({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [tab, setTab] = useState<Tab>("sieve");

  /* sieve: 0 = untouched, 1 = the number 1 is gone, 2..5 = after round 2/3/5/7,
   * 6 = primes revealed. */
  const [step, setStep] = useState(0);

  /* rectangles */
  const [n, setN] = useState(12);

  /* quiz */
  const [question, setQuestion] = useState(QUIZ_POOL[0]);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [right, setRight] = useState(0);
  const [asked, setAsked] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const started = useRef(false);

  /* Pick the first question on the client only: a random number during render
   * would differ between the server HTML and the first client render. */
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- see comment above */
    if (!started.current) {
      started.current = true;
      setQuestion(QUIZ_POOL[Math.floor(Math.random() * QUIZ_POOL.length)]);
    }
    try {
      const raw = localStorage.getItem(STORE_BEST);
      const parsed = raw ? Number.parseInt(raw, 10) : 0;
      if (Number.isFinite(parsed) && parsed > 0) setBestStreak(parsed);
    } catch {
      /* private mode — persistence is best-effort */
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const rounds = useMemo(() => ROUNDS.slice(0, Math.max(0, step - 1)), [step]);
  const revealed = step >= ROUNDS.length + 2;

  const gone = useMemo(() => {
    const set = new Set<number>();
    if (step >= 1) set.add(1);
    for (const p of rounds) {
      for (let k = p * 2; k <= MAX; k += p) set.add(k);
    }
    return set;
  }, [step, rounds]);

  const openRect = (value: number) => {
    setN(value);
    setTab("rect");
  };

  const answer = (saidPrime: boolean) => {
    if (answered !== null) return;
    const correct = saidPrime === isPrime(question);
    setAnswered(correct);
    setAsked((a) => a + 1);
    if (correct) {
      setRight((r) => r + 1);
      const next = streak + 1;
      setStreak(next);
      if (next > bestStreak) {
        setBestStreak(next);
        try {
          localStorage.setItem(STORE_BEST, String(next));
        } catch {
          /* best-effort */
        }
      }
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    let pick = question;
    while (pick === question) pick = QUIZ_POOL[Math.floor(Math.random() * QUIZ_POOL.length)];
    setQuestion(pick);
    setAnswered(null);
  };

  const resetScore = () => {
    setRight(0);
    setAsked(0);
    setStreak(0);
    setAnswered(null);
  };

  /* ───────────────────────────── shared bits ─────────────────────────────── */

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

  /* ─────────────────────────────── sieve tab ─────────────────────────────── */

  const nextLabel =
    step === 0 ? t.crossOne : step <= ROUNDS.length ? t.crossOut(ROUNDS[step - 1]) : t.reveal;

  const sieveTab = (
    <div>
      <p className="text-sm leading-relaxed text-gray-600">{t.sieveIntro}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!revealed && (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-indigo-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            {nextLabel}
          </button>
        )}
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(0)}
            className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
          >
            ↺ {t.startOver}
          </button>
        )}
        {!revealed && step > 0 && (
          <span className="text-xs text-gray-400">{t.stepOf(step, ROUNDS.length + 2)}</span>
        )}
      </div>

      {step === 1 && (
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
          {t.oneWhy}
        </p>
      )}

      {rounds.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
          <span className="font-medium">{t.legend}:</span>
          {rounds.map((p) => (
            <span key={p} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: ROUND_COLOR[p].dot }}
              />
              {p}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-10 gap-1 sm:gap-1.5">
        {Array.from({ length: MAX }, (_, i) => i + 1).map((value) => {
          const by = gone.has(value) ? CROSSED_BY[value] : null;
          const isOne = value === 1 && gone.has(1);
          const survives = !gone.has(value);
          const shown = revealed && survives;
          const label = by
            ? t.a11yCrossed(value, by)
            : shown
              ? t.a11yPrime(value)
              : t.a11yOpen(value);

          return (
            <button
              key={value}
              type="button"
              onClick={() => openRect(value)}
              aria-label={label}
              className={`relative aspect-square rounded-md border text-center text-[11px] font-semibold leading-none transition-colors sm:text-sm ${
                isOne
                  ? "border-gray-200 bg-gray-100 text-gray-400"
                  : by
                    ? `${ROUND_COLOR[by].cell} ${ROUND_COLOR[by].text} opacity-70`
                    : shown
                      ? "border-amber-300 bg-amber-100 text-amber-900 shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              <span className="absolute inset-0 flex items-center justify-center">{value}</span>
              {(by || isOne) && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="h-[1.5px] w-[112%] rotate-[-38deg] bg-current opacity-45" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-sm">
        <span className="text-gray-500">
          {t.stillStanding}: <b className="text-gray-800">{MAX - gone.size}</b>
        </span>
        <span className="text-gray-500">
          {t.crossedOut}: <b className="text-gray-800">{gone.size}</b>
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-400">{rounds.length ? t.keepsColor : t.tapHint}</p>

      {revealed && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-amber-50 px-4 py-3">
            <p className="font-semibold text-amber-900">🎉 {t.doneTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-800">{t.doneBody}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="font-semibold text-gray-800">{t.whyStop}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{t.whyStopBody}</p>
          </div>
        </div>
      )}
    </div>
  );

  /* ──────────────────────────── rectangles tab ──────────────────────────── */

  const rectPairs = pairs(n);
  const nIsPrime = isPrime(n);
  const factor = smallestFactor(n);

  const rectTab = (
    <div>
      <p className="text-sm leading-relaxed text-gray-600">{t.rectIntro}</p>

      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3">
        <div>
          <div className="text-sm font-medium text-gray-600">{t.numberLabel}</div>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setN((v) => Math.max(1, v - 1))}
              disabled={n <= 1}
              aria-label={`${t.numberLabel} −`}
              className="h-9 w-9 rounded-lg bg-gray-100 text-lg font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-40"
            >
              −
            </button>
            <span className="w-12 text-center text-2xl font-bold text-gray-900">{n}</span>
            <button
              type="button"
              onClick={() => setN((v) => Math.min(MAX, v + 1))}
              disabled={n >= MAX}
              aria-label={`${t.numberLabel} +`}
              className="h-9 w-9 rounded-lg bg-gray-100 text-lg font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">{t.tryThese}</span>
          {[12, 13, 24, 29, 36, 97].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setN(p)}
              aria-pressed={n === p}
              className={`rounded-lg px-3 py-1 text-sm font-semibold transition-colors ${
                n === p ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-4">
        {rectPairs.map(([a, b]) => (
          <figure key={`${a}x${b}`} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div
              className="mx-auto"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${b}, 1fr)`,
                gap: 3,
                width: "fit-content",
              }}
              aria-hidden="true"
            >
              {Array.from({ length: n }).map((_, i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: nIsPrime ? "#D97706" : "#4f46e5" }}
                />
              ))}
            </div>
            <figcaption className="mt-2 text-center text-sm font-semibold text-gray-600">
              {t.rectLabel(a, b)}
              {a === b && <span className="ml-1 text-xs font-normal text-gray-400">({t.square})</span>}
            </figcaption>
          </figure>
        ))}
      </div>

      <div
        className={`mt-5 rounded-xl px-4 py-3 ${
          n === 1 ? "bg-gray-50" : nIsPrime ? "bg-amber-50" : "bg-indigo-50"
        }`}
      >
        <p
          className={`font-semibold ${
            n === 1 ? "text-gray-800" : nIsPrime ? "text-amber-900" : "text-indigo-900"
          }`}
        >
          {n === 1 ? t.rectOne : n === 2 ? t.rectTwo : nIsPrime ? t.rectPrime(n) : t.rectComposite(n, rectPairs.length)}
        </p>
        <p
          className={`mt-1 text-sm leading-relaxed ${
            n === 1 ? "text-gray-600" : nIsPrime ? "text-amber-800" : "text-indigo-800"
          }`}
        >
          {n === 1
            ? t.rectOneWhy
            : n === 2
              ? t.rectTwoWhy
              : nIsPrime
                ? t.rectPrimeWhy(n)
                : t.rectCompositeWhy(n)}
        </p>
        {n > 1 && (
          <p className="mt-2 text-sm text-gray-600">
            {t.divisors}: <span className="font-mono font-semibold">{divisorsOf(n).join(", ")}</span>
          </p>
        )}
        {factor !== null && (
          <p className="mt-1 text-xs text-gray-500">{t.firstFactor(n, factor)}</p>
        )}
      </div>
    </div>
  );

  /* ─────────────────────────────── quiz tab ─────────────────────────────── */

  const qFactor = smallestFactor(question);
  const quizTab = (
    <div>
      <p className="text-sm leading-relaxed text-gray-600">{t.quizIntro}</p>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-6 text-center">
        <p className="font-sans text-lg font-medium text-gray-600">{t.isItPrime(question)}</p>
        <p className="mt-1 text-5xl font-extrabold text-indigo-700">{question}</p>

        {answered === null ? (
          <>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => answer(true)}
                className="rounded-full bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700"
              >
                {t.yesPrime}
              </button>
              <button
                type="button"
                onClick={() => answer(false)}
                className="rounded-full bg-gray-200 px-6 py-2.5 font-semibold text-gray-800 hover:bg-gray-300"
              >
                {t.notPrime}
              </button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-gray-400">{t.hint}</p>
          </>
        ) : (
          <div className="mt-5">
            <p
              className={`text-lg font-bold ${answered ? "text-emerald-700" : "text-orange-700"}`}
              aria-live="polite"
            >
              {answered ? `✅ ${t.right}` : `🤔 ${t.nope}`}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600">
              {qFactor === null
                ? t.becausePrime(question)
                : t.becauseComposite(question, qFactor, question / qFactor)}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={nextQuestion}
                className="rounded-full bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700"
              >
                {t.next} →
              </button>
              <button
                type="button"
                onClick={() => openRect(question)}
                className="rounded-full bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                {t.showRect}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-gray-500">
          <span>
            {t.score}:{" "}
            <b className="text-gray-800">
              {right} / {asked}
            </b>
          </span>
          <span>
            {t.streak}: <b className="text-gray-800">{streak}</b>
          </span>
          <span>
            {t.best}: <b className="text-gray-800">{bestStreak}</b>
          </span>
        </div>
        {asked > 0 && (
          <button
            type="button"
            onClick={resetScore}
            className="text-xs font-semibold text-gray-400 underline hover:text-gray-600"
          >
            {t.reset}
          </button>
        )}
      </div>
    </div>
  );

  /* ──────────────────────────────── shell ───────────────────────────────── */

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <div className="flex flex-wrap gap-2">
        {chip(tab === "sieve", t.tabSieve, () => setTab("sieve"))}
        {chip(tab === "rect", t.tabRect, () => setTab("rect"))}
        {chip(tab === "quiz", t.tabQuiz, () => setTab("quiz"))}
      </div>

      <div className="mt-5">
        {tab === "sieve" ? sieveTab : tab === "rect" ? rectTab : quizTab}
      </div>
    </div>
  );
}
