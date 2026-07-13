"use client";

import { Fragment, useEffect, useRef, useState } from "react";

type Lang = "en" | "hr";
type Tab = "see" | "break" | "table";
type View = "groups" | "array" | "line";

const COPY = {
  en: {
    tabSee: "See it",
    tabBreak: "Break it apart",
    tabTable: "The table",
    breakHint: "Drag the handle or tap the grid to split it into two easy pieces.",
    splitAfter: "Split after row",
    presetFive: "Break at 5",
    presetHalf: "Split in half",
    presetTen: "10 + the rest",
    presetMinus: "The ×9 trick (one row less)",
    breakNeedsTwo: "Make the first number 2 or more to break it apart.",
    a11ySplit: "Split position",
    groups: "Groups",
    array: "Grid",
    line: "Number line",
    flip: "Flip it",
    flipHint: (a: number, b: number) => `${a} × ${b} = ${b} × ${a} (same answer!)`,
    groupsOf: (a: number, b: number) => `${a} ${a === 1 ? "group" : "groups"} of ${b}`,
    jumpsOf: (a: number, b: number) => `${a} ${a === 1 ? "jump" : "jumps"} of ${b}`,
    tableSize: "Table up to",
    tapCell: "Tap any answer to light up its row and column.",
    twin: (a: number, b: number, p: number) =>
      `Its mirror twin ${b} × ${a} = ${p}: one fact learned, two answers earned.`,
    seeIt: "See it in pictures",
    knownTitle: "How much do you really need to memorize?",
    knownIntro: "Cross off the families you can work out with a trick:",
    left: (n: number) => `${n}`,
    leftLabel: (n: number, total: number) => `facts left to learn (of ${total})`,
    fam1: "×1: every number stays itself",
    fam2: "×2: just double it",
    fam5: "×5: count by fives",
    fam9: "×9: the finger trick",
    fam10: "×10: add a zero",
    fam11: "×11: repeat the digit (22, 33, 44…)",
    famMirror: "Mirror twins: 6 × 4 is the same as 4 × 6",
    a11yCell: (a: number, b: number, p: number) => `${a} times ${b} equals ${p}`,
    a11yFlip: "Swap the two numbers",
  },
  hr: {
    tabSee: "Vizualiziraj",
    tabBreak: "Rastavi",
    tabTable: "Tablica množenja",
    breakHint: "Povuci ručicu ili dodirni mrežu da je rastaviš na dva lakša dijela.",
    splitAfter: "Rastavi nakon retka",
    presetFive: "Rastavi na 5",
    presetHalf: "Podijeli napola",
    presetTen: "10 + ostatak",
    presetMinus: "Trik za ×9 (redak manje)",
    breakNeedsTwo: "Postavi prvi broj na 2 ili više da ga rastaviš.",
    a11ySplit: "Mjesto rastavljanja",
    groups: "Grupe",
    array: "Mreža",
    line: "Brojevni pravac",
    flip: "Zamijeni",
    flipHint: (a: number, b: number) => `${a} × ${b} = ${b} × ${a} (isti rezultat!)`,
    groupsOf: (a: number, b: number) => `${a} ${hrPlural(a, "grupa", "grupe", "grupa")} po ${b}`,
    jumpsOf: (a: number, b: number) => `${a} ${hrPlural(a, "skok", "skoka", "skokova")} po ${b}`,
    tableSize: "Tablica do",
    tapCell: "Dodirni bilo koji rezultat da mu osvijetliš redak i stupac.",
    twin: (a: number, b: number, p: number) =>
      `Njegov blizanac ${b} × ${a} = ${p}: jedan naučen, dva znaš.`,
    seeIt: "Prikaži slikom",
    knownTitle: "Koliko zapravo trebaš naučiti napamet?",
    knownIntro: "Prekriži obitelji koje znaš izračunati trikom:",
    left: (n: number) => `${n}`,
    leftLabel: (n: number, total: number) => `${hrPlural(n, "umnožak", "umnoška", "umnožaka")} za naučiti (od ${total})`,
    fam1: "×1: svaki broj ostaje isti",
    fam2: "×2: samo udvostruči",
    fam5: "×5: broji po pet",
    fam9: "×9: trik s prstima",
    fam10: "×10: dodaj nulu",
    fam11: "×11: ponovi znamenku (22, 33, 44…)",
    famMirror: "Blizanci: 6 × 4 isto je što i 4 × 6",
    a11yCell: (a: number, b: number, p: number) => `${a} puta ${b} jednako je ${p}`,
    a11yFlip: "Zamijeni brojeve",
  },
} as const;

/** Croatian plural: 1 → one, 2-4 → few, else → many (with 12-14 exception). */
function hrPlural(n: number, one: string, few: string, many: string): string {
  if (n % 10 === 1 && n % 100 !== 11) return one;
  if (n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)) return few;
  return many;
}

const FILL = "#4f46e5"; // indigo — matches FractionVisualizer
const ACCENT = "#FB6F52"; // brand coral

const MAX = 12;
const STORE_SIZE = "mult-viz:tableMax";
const STORE_KNOWN = "mult-viz:known";

/** Fact families that have a mental-math trick. ×11 only shows on the 12-table. */
const FAMILIES = [1, 2, 5, 9, 10, 11] as const;
type Family = (typeof FAMILIES)[number];
const FAMILY_LABEL: Record<Family, "fam1" | "fam2" | "fam5" | "fam9" | "fam10" | "fam11"> = {
  1: "fam1",
  2: "fam2",
  5: "fam5",
  9: "fam9",
  10: "fam10",
  11: "fam11",
};

export default function MultiplicationVisualizer({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [a, setA] = useState(4);
  const [b, setB] = useState(6);
  const [tab, setTab] = useState<Tab>("see");
  const [view, setView] = useState<View>("array");
  const [flipping, setFlipping] = useState(false);
  const [tableMax, setTableMax] = useState<10 | 12>(lang === "hr" ? 10 : 12);
  const [known, setKnown] = useState<Family[]>([]);
  const [mirror, setMirror] = useState(false);
  const [split, setSplit] = useState(2);
  const [minusMode, setMinusMode] = useState(false);
  const breakSvgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef(false);

  const product = a * b;
  /* Break-apart derived state: split stays inside 1..a-1; the ×9 subtraction
   * view only makes sense while the first factor IS 9. */
  const canSplit = a > 1;
  const s = Math.max(1, Math.min(split, a - 1));
  const minus = minusMode && a === 9;

  /* Restore persisted table settings after mount (SSR renders defaults).
   * This must run in an effect, not during render: localStorage is unavailable
   * on the server, so reading it any earlier would make the first client render
   * diverge from the SSR HTML and trigger a hydration mismatch. The one-time
   * setState here is the intended behaviour, hence the scoped rule disable. */
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- see comment above */
    try {
      const size = localStorage.getItem(STORE_SIZE);
      if (size === "10" || size === "12") setTableMax(Number(size) as 10 | 12);
      const raw = localStorage.getItem(STORE_KNOWN);
      if (raw) {
        const parsed = JSON.parse(raw) as { fams?: number[]; mirror?: boolean };
        setKnown((parsed.fams ?? []).filter((n): n is Family => FAMILIES.includes(n as Family)));
        setMirror(!!parsed.mirror);
      }
    } catch {
      /* private mode — persistence is best-effort */
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const persistKnown = (fams: Family[], mir: boolean) => {
    try {
      localStorage.setItem(STORE_KNOWN, JSON.stringify({ fams, mirror: mir }));
    } catch {}
  };

  const toggleFamily = (f: Family) => {
    const next = known.includes(f) ? known.filter((k) => k !== f) : [...known, f];
    setKnown(next);
    persistKnown(next, mirror);
  };
  const toggleMirror = () => {
    setMirror(!mirror);
    persistKnown(known, !mirror);
  };
  const pickSize = (n: 10 | 12) => {
    setTableMax(n);
    try {
      localStorage.setItem(STORE_SIZE, String(n));
    } catch {}
  };

  const flip = () => {
    setFlipping(true);
    setA(b);
    setB(a);
    window.setTimeout(() => setFlipping(false), 180);
  };

  const pickCell = (row: number, col: number) => {
    setA(row);
    setB(col);
  };

  /* ----- break-apart drag ----- */
  const splitFromPointer = (clientY: number) => {
    const el = breakSvgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vbH = a * cell + 8;
    const yVb = ((clientY - rect.top) / rect.height) * vbH;
    setSplit(Math.max(1, Math.min(a - 1, Math.round((yVb - 4) / cell))));
    setMinusMode(false);
  };
  const onBreakPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!canSplit || minus) {
      if (minus) setMinusMode(false);
      return;
    }
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    splitFromPointer(e.clientY);
  };
  const onBreakPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingRef.current) splitFromPointer(e.clientY);
  };
  const onBreakPointerUp = () => {
    draggingRef.current = false;
  };

  /* ----- eliminator math ----- */
  const famSet = new Set<number>(known.filter((f) => f <= tableMax));
  const freeCount = tableMax - famSet.size; // numbers with no trick
  const totalFacts = tableMax * tableMax;
  const remaining = mirror ? (freeCount * (freeCount + 1)) / 2 : freeCount * freeCount;
  const isMuted = (row: number, col: number) =>
    famSet.has(row) || famSet.has(col) || (mirror && row > col);

  /* ----- shared bits ----- */
  const stepper = (label: string, value: number, onChange: (n: number) => void) => (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label={`${label} −`}
        className="h-9 w-9 rounded-lg bg-gray-100 text-lg font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-40"
      >
        −
      </button>
      <span className="w-8 text-center text-2xl font-bold text-gray-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX}
        aria-label={`${label} +`}
        className="h-9 w-9 rounded-lg bg-gray-100 text-lg font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-40"
      >
        +
      </button>
    </div>
  );

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

  const equation = (
    <p className="mt-4 text-center font-sans text-sm text-gray-600" aria-hidden="true">
      {a} × {b} = {Array.from({ length: a }, () => b).join(" + ")} ={" "}
      <b className="text-lg text-indigo-700">{product}</b>
    </p>
  );

  /* ----- views ----- */

  const groupsView = (
    <div>
      <p className="text-center font-sans text-sm font-medium text-gray-500">{t.groupsOf(a, b)}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {Array.from({ length: a }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-2"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(b, 4)}, 1fr)`,
              gap: 4,
            }}
          >
            {Array.from({ length: b }).map((_, j) => (
              <span key={j} className="h-3.5 w-3.5 rounded-full" style={{ background: FILL }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  // b columns × a rows of dots; cumulative skip-count labels on the right edge.
  const cell = 36;
  const labelW = 54;
  const arrayView = (
    <svg
      viewBox={`0 0 ${b * cell + labelW} ${a * cell + 8}`}
      className="mx-auto block max-h-80 w-full max-w-lg"
      role="img"
      aria-label={t.a11yCell(a, b, product)}
    >
      {Array.from({ length: a }).map((_, i) => (
        <g key={i}>
          {Array.from({ length: b }).map((_, j) => (
            <circle
              key={j}
              cx={j * cell + cell / 2}
              cy={i * cell + cell / 2 + 4}
              r={13}
              fill={FILL}
              opacity={0.5 + (0.5 * (i + 1)) / a}
            />
          ))}
          <text
            x={b * cell + 10}
            y={i * cell + cell / 2 + 9}
            fontSize={i === a - 1 ? 17 : 13}
            fontWeight={i === a - 1 ? 700 : 500}
            fill={i === a - 1 ? FILL : "#9ca3af"}
            fontFamily="inherit"
          >
            {(i + 1) * b}
          </text>
        </g>
      ))}
    </svg>
  );

  const lineView = (() => {
    const w = 720;
    const pad = 26;
    const x = (v: number) => pad + (v / product) * (w - 2 * pad);
    const y0 = 84;
    return (
      <div>
        <p className="text-center font-sans text-sm font-medium text-gray-500">{t.jumpsOf(a, b)}</p>
        <svg viewBox={`0 0 ${w} 120`} className="mt-1 block w-full" aria-hidden="true">
          <line x1={pad} y1={y0} x2={w - pad} y2={y0} stroke="#d1d5db" strokeWidth={2} />
          {product <= 24 &&
            Array.from({ length: product + 1 }).map((_, v) => (
              <line key={v} x1={x(v)} y1={y0 - 4} x2={x(v)} y2={y0 + 4} stroke="#d1d5db" />
            ))}
          {Array.from({ length: a }).map((_, k) => (
            <path
              key={k}
              d={`M ${x(k * b)} ${y0} Q ${x(k * b + b / 2)} ${y0 - 44} ${x((k + 1) * b)} ${y0}`}
              fill="none"
              stroke={ACCENT}
              strokeWidth={2.5}
            />
          ))}
          {Array.from({ length: a + 1 }).map((_, k) => (
            <g key={k}>
              <line x1={x(k * b)} y1={y0 - 6} x2={x(k * b)} y2={y0 + 6} stroke="#6b7280" strokeWidth={2} />
              <text
                x={x(k * b)}
                y={y0 + 24}
                textAnchor="middle"
                fontSize={k === a ? 17 : 13}
                fontWeight={k === a ? 700 : 500}
                fill={k === a ? FILL : "#6b7280"}
                fontFamily="inherit"
              >
                {k * b}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  })();

  /* ----- break-apart tab ----- */

  const breakLabelW = 92;
  const breakRows = minus ? 10 : a;
  const breakTab = !canSplit ? (
    <div>
      <p className="text-center font-sans text-sm text-gray-500">{t.breakNeedsTwo}</p>
      <div className="mt-4">{arrayView}</div>
    </div>
  ) : (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {a >= 6 && chip(!minus && s === 5, t.presetFive, () => { setSplit(5); setMinusMode(false); })}
        {a % 2 === 0 && chip(!minus && s === a / 2, t.presetHalf, () => { setSplit(a / 2); setMinusMode(false); })}
        {a > 10 && chip(!minus && s === 10, t.presetTen, () => { setSplit(10); setMinusMode(false); })}
        {a === 9 && chip(minus, t.presetMinus, () => setMinusMode(!minusMode))}
      </div>
      <p className="mt-2 text-center font-sans text-xs text-gray-400">{t.breakHint}</p>

      <svg
        ref={breakSvgRef}
        viewBox={`0 0 ${b * cell + breakLabelW} ${breakRows * cell + 8}`}
        className="mx-auto mt-3 block max-h-96 w-full max-w-lg cursor-row-resize select-none"
        style={{ touchAction: "none" }}
        onPointerDown={onBreakPointerDown}
        onPointerMove={onBreakPointerMove}
        onPointerUp={onBreakPointerUp}
        onPointerCancel={onBreakPointerUp}
        role="img"
        aria-label={
          minus
            ? `9 × ${b} = 10 × ${b} − ${b}`
            : `${a} × ${b} = ${s} × ${b} + ${a - s} × ${b}`
        }
      >
        {Array.from({ length: breakRows }).map((_, i) => {
          const inPartTwo = minus ? i === 9 : i >= s;
          return (
            <g key={i}>
              {Array.from({ length: b }).map((_, j) => (
                <circle
                  key={j}
                  cx={j * cell + cell / 2}
                  cy={i * cell + cell / 2 + 4}
                  r={13}
                  fill={inPartTwo ? ACCENT : FILL}
                  opacity={minus && i === 9 ? 0.35 : 0.9}
                />
              ))}
            </g>
          );
        })}

        {/* part labels in the right gutter */}
        {minus ? (
          <>
            <text x={b * cell + 12} y={(9 * cell) / 2 + 9} fontSize={15} fontWeight={700} fill={FILL} fontFamily="inherit">
              10×{b}={10 * b}
            </text>
            <text x={b * cell + 12} y={9.5 * cell + 9} fontSize={15} fontWeight={700} fill={ACCENT} fontFamily="inherit">
              −{b}
            </text>
          </>
        ) : (
          <>
            <text x={b * cell + 12} y={(s * cell) / 2 + 9} fontSize={15} fontWeight={700} fill={FILL} fontFamily="inherit">
              {s}×{b}={s * b}
            </text>
            <text x={b * cell + 12} y={((s + a) * cell) / 2 + 9} fontSize={15} fontWeight={700} fill={ACCENT} fontFamily="inherit">
              {a - s}×{b}={(a - s) * b}
            </text>
          </>
        )}

        {minus ? (
          <line x1={-4} y1={9.5 * cell + 4} x2={b * cell + 4} y2={9.5 * cell + 4} stroke={ACCENT} strokeWidth={3} />
        ) : (
          <g>
            <line x1={-4} y1={s * cell + 4} x2={b * cell + 4} y2={s * cell + 4} stroke="#111827" strokeWidth={3} strokeLinecap="round" />
            <circle cx={b * cell + 4} cy={s * cell + 4} r={12} fill="#fff" stroke="#111827" strokeWidth={2.5} />
            <text x={b * cell + 4} y={s * cell + 9} textAnchor="middle" fontSize={13} fontWeight={700} fill="#111827" fontFamily="inherit">
              ↕
            </text>
          </g>
        )}
      </svg>

      {/* keyboard / assistive alternative to dragging */}
      {!minus && (
        <div className="mt-2 flex items-center justify-center gap-2 font-sans text-sm text-gray-500">
          {t.splitAfter}
          <button
            type="button"
            onClick={() => { setSplit(Math.max(1, s - 1)); setMinusMode(false); }}
            disabled={s <= 1}
            aria-label={`${t.a11ySplit} −`}
            className="h-7 w-7 rounded-md bg-gray-100 font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-40"
          >
            −
          </button>
          <span className="w-5 text-center font-bold text-gray-900">{s}</span>
          <button
            type="button"
            onClick={() => { setSplit(Math.min(a - 1, s + 1)); setMinusMode(false); }}
            disabled={s >= a - 1}
            aria-label={`${t.a11ySplit} +`}
            className="h-7 w-7 rounded-md bg-gray-100 font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-40"
          >
            +
          </button>
        </div>
      )}

      <p className="mt-4 text-center font-sans text-sm text-gray-600">
        {minus ? (
          <>
            9 × {b} = <b style={{ color: FILL }}>10 × {b}</b> − <b style={{ color: ACCENT }}>{b}</b> ={" "}
            <b style={{ color: FILL }}>{10 * b}</b> − <b style={{ color: ACCENT }}>{b}</b> ={" "}
            <b className="text-lg text-indigo-700">{product}</b>
          </>
        ) : (
          <>
            {a} × {b} = <b style={{ color: FILL }}>{s} × {b}</b> + <b style={{ color: ACCENT }}>{a - s} × {b}</b> ={" "}
            <b style={{ color: FILL }}>{s * b}</b> + <b style={{ color: ACCENT }}>{(a - s) * b}</b> ={" "}
            <b className="text-lg text-indigo-700">{product}</b>
          </>
        )}
      </p>
    </div>
  );

  /* ----- table tab ----- */

  const tableTab = (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-sm text-gray-500">{t.tapCell}</p>
        <div className="flex items-center gap-1.5 font-sans text-sm text-gray-500">
          {t.tableSize}
          {chip(tableMax === 10, "10", () => pickSize(10))}
          {chip(tableMax === 12, "12", () => pickSize(12))}
        </div>
      </div>

      <div
        className="mt-3 grid gap-px overflow-x-auto rounded-lg"
        style={{ gridTemplateColumns: `repeat(${tableMax + 1}, minmax(0, 1fr))` }}
      >
        <span className="rounded bg-gray-50 p-1 text-center text-xs font-bold text-gray-400">×</span>
        {Array.from({ length: tableMax }).map((_, j) => (
          <span key={j} className="rounded bg-gray-100 p-1 text-center text-xs font-bold text-gray-500">
            {j + 1}
          </span>
        ))}
        {Array.from({ length: tableMax }).map((_, i) => {
          const row = i + 1;
          return (
            <Fragment key={row}>
              <span className="rounded bg-gray-100 p-1 text-center text-xs font-bold text-gray-500">
                {row}
              </span>
              {Array.from({ length: tableMax }).map((_, j) => {
                const col = j + 1;
                const sel = row === a && col === b;
                const twin = row === b && col === a && a !== b;
                const onPath = (row === a && col < b) || (col === b && row < a);
                const muted = isMuted(row, col);
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => pickCell(row, col)}
                    aria-label={t.a11yCell(row, col, row * col)}
                    aria-pressed={sel}
                    className={`rounded p-1 text-center font-sans text-[11px] font-semibold transition-colors sm:text-xs ${
                      sel
                        ? "bg-indigo-600 text-white"
                        : onPath
                          ? "bg-orange-100 text-gray-800"
                          : row === col
                            ? "bg-indigo-50 text-indigo-800"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                    } ${twin ? "outline-2 outline-dashed outline-[#FB6F52]" : ""} ${
                      muted && !sel ? "text-gray-300 line-through" : ""
                    }`}
                  >
                    {row * col}
                  </button>
                );
              })}
            </Fragment>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-xl bg-indigo-50 p-3 font-sans">
        <span className="text-xl font-bold text-indigo-700">
          {a} × {b} = {product}
        </span>
        {a !== b && <span className="text-sm text-gray-600">{t.twin(a, b, product)}</span>}
        <button
          type="button"
          onClick={() => setTab("see")}
          className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          {t.seeIt} →
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4 font-sans">
        <p className="font-bold text-gray-800">{t.knownTitle}</p>
        <p className="mt-0.5 text-sm text-gray-500">{t.knownIntro}</p>
        <div className="mt-3 flex flex-wrap items-start gap-x-6 gap-y-1.5">
          <div className="min-w-52 flex-1 space-y-1.5">
            {FAMILIES.filter((f) => f <= tableMax).map((f) => (
              <label key={f} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={known.includes(f)}
                  onChange={() => toggleFamily(f)}
                  className="h-4 w-4 accent-indigo-600"
                />
                <span className={known.includes(f) ? "text-gray-400 line-through" : ""}>
                  {t[FAMILY_LABEL[f]]}
                </span>
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={mirror}
                onChange={toggleMirror}
                className="h-4 w-4 accent-indigo-600"
              />
              <span className={mirror ? "text-gray-400 line-through" : ""}>{t.famMirror}</span>
            </label>
          </div>
          <div className="mx-auto text-center">
            <div className="text-5xl font-extrabold" style={{ color: remaining <= 25 ? "#15803d" : FILL }}>
              {t.left(remaining)}
            </div>
            <div className="mt-1 max-w-40 text-xs text-gray-500">{t.leftLabel(remaining, totalFacts)}</div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ----- shell ----- */

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <div className="flex flex-wrap gap-2">
        {chip(tab === "see", t.tabSee, () => setTab("see"))}
        {chip(tab === "break", t.tabBreak, () => setTab("break"))}
        {chip(tab === "table", t.tabTable, () => setTab("table"))}
      </div>

      {tab !== "table" ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            {stepper("a", a, (n) => setA(Math.min(MAX, Math.max(1, n))))}
            <span className="text-2xl font-bold text-gray-400">×</span>
            {stepper("b", b, (n) => setB(Math.min(MAX, Math.max(1, n))))}
            <span className="text-2xl font-bold text-gray-400">=</span>
            <span className="text-3xl font-extrabold text-indigo-700">{product}</span>
            <button
              type="button"
              onClick={flip}
              aria-label={t.a11yFlip}
              className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-[#FB6F52] hover:bg-orange-100"
            >
              ⇄ {t.flip}
            </button>
          </div>
          <p className="mt-1 text-center text-xs text-gray-400">{t.flipHint(a, b)}</p>

          {tab === "see" ? (
            <>
              <div className="mt-4 flex justify-center gap-2">
                {chip(view === "groups", t.groups, () => setView("groups"))}
                {chip(view === "array", t.array, () => setView("array"))}
                {chip(view === "line", t.line, () => setView("line"))}
              </div>

              <div
                className={`mt-5 transition-all duration-150 ${flipping ? "scale-95 opacity-50" : "scale-100 opacity-100"}`}
              >
                {view === "groups" && groupsView}
                {view === "array" && arrayView}
                {view === "line" && lineView}
              </div>

              {equation}
            </>
          ) : (
            <div className="mt-4">{breakTab}</div>
          )}
        </div>
      ) : (
        <div className="mt-5">{tableTab}</div>
      )}

      <p className="sr-only" aria-live="polite">
        {t.a11yCell(a, b, product)}
      </p>
    </div>
  );
}
