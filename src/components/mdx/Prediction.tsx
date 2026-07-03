"use client";

import React, { createContext, useContext, useId, useState } from "react";

type Lang = "en" | "hr";

const COPY = {
  en: {
    question: "What do you think will happen?",
    hint: "Make your prediction, then tap an answer to check!",
    correct: "🎉 Great prediction!",
    incorrect: "🤔 Not quite — but guessing is how science starts!",
  },
  hr: {
    question: "Što misliš, što će se dogoditi?",
    hint: "Pogodi, a zatim dodirni odgovor i provjeri!",
    correct: "🎉 Odlično predviđanje!",
    incorrect: "🤔 Ne baš — ali pogađanje je početak svake znanosti!",
  },
} as const;

interface PredictionCtx {
  answered: boolean;
  selectedId: string | null;
  select: (id: string, correct: boolean) => void;
}

const Ctx = createContext<PredictionCtx | null>(null);

interface PredictionProps {
  lang?: Lang;
  /** Override the default "What do you think will happen?" question. */
  question?: string;
  children: React.ReactNode;
}

/**
 * Hypothesis widget — the scientific method as a UI element. The reader picks
 * a prediction before seeing the experiment's outcome:
 *
 *   <Prediction>
 *   <PredictionOption>Nothing happens</PredictionOption>
 *   <PredictionOption correct="true">The can gets crushed</PredictionOption>
 *   <PredictionResult>The steam inside condenses and… (markdown ok)</PredictionResult>
 *   </Prediction>
 *
 * Options are child elements with string props (next-mdx-remote drops
 * array/object props — see Materials.tsx). The result block stays hidden
 * until an option is picked. Interactive-only, so hidden in print.
 */
export default function Prediction({
  lang = "en",
  question,
  children,
}: PredictionProps) {
  const t = COPY[lang];
  const [selected, setSelected] = useState<{
    id: string;
    correct: boolean;
  } | null>(null);

  const ctx: PredictionCtx = {
    answered: selected !== null,
    selectedId: selected?.id ?? null,
    select: (id, correct) => setSelected((prev) => prev ?? { id, correct }),
  };

  return (
    <div
      data-no-print
      className="not-prose my-8 rounded-2xl border-2 border-brand-soft bg-brand-soft/40 p-5 font-sans"
    >
      <p className="text-base font-bold text-gray-900">
        <span aria-hidden="true">🔮</span> {question ?? t.question}
      </p>
      <p
        aria-live="polite"
        className={`mb-4 mt-1 text-sm font-medium ${
          selected === null
            ? "text-gray-500"
            : selected.correct
              ? "text-green-700"
              : "text-amber-700"
        }`}
      >
        {selected === null
          ? t.hint
          : selected.correct
            ? t.correct
            : t.incorrect}
      </p>

      <Ctx.Provider value={ctx}>
        <div className="grid gap-2">{children}</div>
      </Ctx.Provider>
    </div>
  );
}

interface PredictionOptionProps {
  /** Mark the right answer: `correct` or `correct="true"`. */
  correct?: boolean | string;
  children: React.ReactNode;
}

export function PredictionOption({ correct, children }: PredictionOptionProps) {
  const ctx = useContext(Ctx);
  const id = useId();

  const isCorrect =
    correct === true ||
    correct === "" ||
    (typeof correct === "string" && correct.toLowerCase() === "true");

  const answered = ctx?.answered ?? false;
  const isSelected = ctx?.selectedId === id;

  const state = !answered
    ? "cursor-pointer border-gray-200 bg-white hover:border-brand hover:bg-brand-soft/40"
    : isCorrect
      ? "border-green-400 bg-green-50 text-green-900"
      : isSelected
        ? "border-red-300 bg-red-50 text-red-900"
        : "border-gray-100 bg-white opacity-60";

  return (
    <button
      type="button"
      disabled={answered}
      onClick={() => ctx?.select(id, isCorrect)}
      className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-left text-sm font-medium transition ${state}`}
    >
      {answered && (
        <span aria-hidden="true">{isCorrect ? "✅" : isSelected ? "❌" : ""}</span>
      )}
      <span>{children}</span>
    </button>
  );
}

export function PredictionResult({ children }: { children: React.ReactNode }) {
  const ctx = useContext(Ctx);
  if (!ctx?.answered) return null;

  return (
    <div className="mt-2 rounded-xl border border-brand-soft bg-white/80 p-4 text-sm leading-relaxed text-gray-800 [&_p]:my-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      {children}
    </div>
  );
}
