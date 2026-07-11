"use client";

import { useRef, useState } from "react";

type Lang = "en" | "hr";

const COPY = {
  en: {
    label: "Your birthday (or any date)",
    placeholder: "e.g. 14/3 or 14.03.1990",
    searchFor: "We'll search for",
    button: "Find it in π",
    loading: "Searching a million digits of π…",
    foundTitle: (pos: string) => `🎉 Found at position ${pos}!`,
    foundBody: (d: string) => `Your number ${d} appears in the digits of π:`,
    notFound: (d: string, n: string) =>
      `${d} isn't in the first ${n} digits of π. Try just the day and month!`,
    empty: "Type a date with some numbers first.",
    failed: "Couldn't load the digits of π. Check your connection and try again.",
  },
  hr: {
    label: "Vaš rođendan (ili bilo koji datum)",
    placeholder: "npr. 14.3. ili 14.03.1990.",
    searchFor: "Tražit ćemo",
    button: "Pronađi u π-ju",
    loading: "Pretražujem milijun znamenki π-ja…",
    foundTitle: (pos: string) => `🎉 Pronađeno na ${pos}. mjestu!`,
    foundBody: (d: string) => `Vaš broj ${d} pojavljuje se u znamenkama π-ja:`,
    notFound: (d: string, n: string) =>
      `${d} se ne nalazi u prvih ${n} znamenki π-ja. Pokušajte samo dan i mjesec!`,
    empty: "Prvo upišite datum s nekoliko brojeva.",
    failed: "Znamenke broja π nisu se uspjele učitati. Provjerite vezu i pokušajte ponovno.",
  },
} as const;

type Result =
  | { found: true; digits: string; pos: number; before: string; after: string }
  | { found: false; digits: string; total: number };

export default function FindBirthdayInPi({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const piRef = useRef<string | null>(null);

  const nf = (n: number) => n.toLocaleString(lang === "hr" ? "hr-HR" : "en-US");
  const digitsOf = (s: string) => s.replace(/\D/g, "").slice(0, 12);
  const liveDigits = digitsOf(input);

  async function getPi() {
    if (piRef.current) return piRef.current;
    const res = await fetch("/pi.txt");
    if (!res.ok) throw new Error(`pi.txt ${res.status}`);
    piRef.current = (await res.text()).trim();
    return piRef.current;
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const digits = digitsOf(input);
    if (!digits) {
      setResult(null);
      return;
    }
    setLoading(true);
    setFailed(false);
    try {
      const pi = await getPi();
      const i = pi.indexOf(digits);
      if (i >= 0) {
        setResult({
          found: true,
          digits,
          pos: i + 1,
          before: pi.slice(Math.max(0, i - 12), i),
          after: pi.slice(i + digits.length, i + digits.length + 12),
        });
      } else {
        setResult({ found: false, digits, total: pi.length });
      }
    } catch {
      setResult(null);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <form onSubmit={search}>
        <label htmlFor="pi-date" className="block text-sm font-medium text-gray-600">
          {t.label}
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          <input
            id="pi-date"
            type="text"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="min-w-[12rem] flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
          >
            {t.button}
          </button>
        </div>
        {liveDigits && (
          <p className="mt-2 text-xs text-gray-400">
            {t.searchFor}: <span className="font-mono font-semibold text-gray-600">{liveDigits}</span>
          </p>
        )}
      </form>

      <div aria-live="polite">
      {loading && <p className="mt-4 text-sm text-gray-500">{t.loading}</p>}

      {!loading && failed && (
        <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{t.failed}</p>
      )}

      {!loading && input.trim() && !digitsOf(input) && (
        <p className="mt-4 text-sm text-gray-500">{t.empty}</p>
      )}

      {!loading && result && result.found && (
        <div className="mt-4 rounded-xl bg-brand-soft p-4">
          <p className="font-semibold text-gray-900">{t.foundTitle(nf(result.pos))}</p>
          <p className="mt-1 text-sm text-gray-600">{t.foundBody(result.digits)}</p>
          <p className="mt-2 break-all font-mono text-[15px] text-gray-700">
            π = 3.<span className="text-gray-400">…{result.before}</span>
            <span className="rounded bg-brand px-1 font-bold text-white">{result.digits}</span>
            <span className="text-gray-400">{result.after}…</span>
          </p>
        </div>
      )}

      {!loading && result && !result.found && (
        <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          {t.notFound(result.digits, nf(result.total))}
        </p>
      )}
      </div>
    </div>
  );
}
