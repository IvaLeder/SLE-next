"use client";

import { useState } from "react";

type Lang = "en" | "hr";

const COPY = {
  en: {
    disks: "Disks",
    moves: "Moves",
    best: "Fewest possible",
    reset: "Restart",
    undo: "Undo",
    goal: "Tap a peg to pick up its top disk, then tap another peg to drop it. Move the whole stack to the last peg. Rule is that a bigger disk can never sit on a smaller one.",
    invalid: "A bigger disk can't go on a smaller one!",
    solved: (n: number) => `Solved in ${n} moves!`,
    perfect: (n: number) => `Perfect, you solved in the fewest possible ${n} moves! 🎉`,
    playAgain: "Play again",
    peg: (n: number) => `Peg ${n}`,
  },
  hr: {
    disks: "Diskovi",
    moves: "Potezi",
    best: "Najmanje moguće",
    reset: "Ponovo",
    undo: "Vrati potez",
    goal: "Kliknite štap da podignete gornji disk, pa kliknite drugi štap da ga spustite. Premjestite cijeli toranj na zadnji štap. Pravilo je da veći disk nikad ne smije biti na manjem.",
    invalid: "Veći disk ne može na manji!",
    solved: (n: number) => `Riješeno u ${n} poteza!`,
    perfect: (n: number) => `Savršeno, riješeno u najmanje moguće, ${n} poteza! 🎉`,
    playAgain: "Igraj ponovo",
    peg: (n: number) => `Štap ${n}`,
  },
} as const;

const DISK_COLORS = ["#FB6F52", "#F4A21E", "#14A098", "#1E88C7", "#8E54B5", "#F25C7A"];

// Each peg is bottom-to-top; the largest disk (= numDisks) starts at the bottom
// of peg 0, the smallest (= 1) on top.
function makePegs(n: number): number[][] {
  const first: number[] = [];
  for (let d = n; d >= 1; d--) first.push(d);
  return [first, [], []];
}

export default function TowerOfHanoi({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [numDisks, setNumDisks] = useState(3);
  const [pegs, setPegs] = useState<number[][]>(() => makePegs(3));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState<number[][][]>([]);

  const minMoves = (1 << numDisks) - 1;
  const solved = pegs[2].length === numDisks;

  function newGame(n: number) {
    setNumDisks(n);
    setPegs(makePegs(n));
    setSelected(null);
    setMoves(0);
    setError(false);
    setHistory([]);
  }

  function undo() {
    if (history.length === 0) return;
    setPegs(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setMoves((m) => m - 1);
    setSelected(null);
    setError(false);
  }

  function clickPeg(i: number) {
    if (solved) return;
    setError(false);
    if (selected === null) {
      if (pegs[i].length > 0) setSelected(i);
      return;
    }
    if (i === selected) {
      setSelected(null);
      return;
    }
    const from = pegs[selected];
    const to = pegs[i];
    const disk = from[from.length - 1];
    const topTo = to.length ? to[to.length - 1] : Infinity;
    if (disk < topTo) {
      const next = pegs.map((p) => p.slice());
      next[i].push(next[selected].pop()!);
      setHistory((h) => [...h, pegs]);
      setPegs(next);
      setMoves((m) => m + 1);
      setSelected(null);
    } else {
      setError(true);
    }
  }

  const boardHeight = numDisks * 26 + 36;

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600">{t.disks}</span>
          <div className="flex gap-1">
            {[3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => newGame(n)}
                aria-pressed={numDisks === n}
                className={`h-8 w-8 rounded-lg text-sm font-semibold transition-colors ${
                  numDisks === n ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-600">{t.moves}:</span>{" "}
          <span className="font-mono font-semibold text-gray-900">{moves}</span>
        </div>
        <div className="text-gray-500">
          {t.best}: <span className="font-mono">{minMoves}</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {history.length > 0 && !solved && (
            <button
              type="button"
              onClick={undo}
              className="text-xs font-semibold text-brand hover:text-brand-hover"
            >
              ⌫ {t.undo}
            </button>
          )}
          <button
            type="button"
            onClick={() => newGame(numDisks)}
            className="text-xs font-semibold text-brand hover:text-brand-hover"
          >
            ↺ {t.reset}
          </button>
        </div>
      </div>

      <div className="relative mt-5 flex items-end gap-3" style={{ height: boardHeight }}>
        <div className="absolute inset-x-0 bottom-0 h-3 rounded bg-amber-200" aria-hidden="true" />
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => clickPeg(i)}
            aria-label={t.peg(i + 1)}
            className={`relative flex h-full flex-1 flex-col items-center justify-end rounded-lg pb-3 transition-colors ${
              selected === i ? "bg-brand-soft" : "hover:bg-gray-50"
            }`}
          >
            <div
              className="absolute bottom-3 left-1/2 w-1.5 -translate-x-1/2 rounded bg-gray-300"
              style={{ height: boardHeight - 24 }}
              aria-hidden="true"
            />
            {pegs[i]
              .slice()
              .reverse()
              .map((size, idx) => {
                const lifted = selected === i && idx === 0;
                return (
                  <div
                    key={size}
                    className="relative z-10 rounded-md"
                    style={{
                      width: `${12 + (size / numDisks) * 88}%`,
                      height: 22,
                      marginBottom: 3,
                      background: DISK_COLORS[size - 1],
                      transform: lifted ? "translateY(-10px)" : "none",
                      boxShadow: lifted ? "0 6px 14px rgba(0,0,0,.25)" : "none",
                    }}
                  />
                );
              })}
          </button>
        ))}
      </div>

      {solved ? (
        <div role="status" className="mt-4 rounded-xl bg-green-50 p-4 text-center">
          <p className="font-semibold text-green-800">
            {moves === minMoves ? t.perfect(moves) : t.solved(moves)}
          </p>
          <button
            type="button"
            onClick={() => newGame(numDisks)}
            className="mt-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            {t.playAgain}
          </button>
        </div>
      ) : (
        <p aria-live="polite" className={`mt-4 text-xs leading-relaxed ${error ? "font-semibold text-red-600" : "text-gray-400"}`}>
          {error ? t.invalid : t.goal}
        </p>
      )}
    </div>
  );
}
