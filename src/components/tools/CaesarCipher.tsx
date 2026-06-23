"use client";

import { useState } from "react";

type Lang = "en" | "hr";

const COPY = {
  en: {
    encode: "Encode",
    decode: "Decode",
    message: "Your message",
    cipher: "Secret message",
    shift: "Shift",
    copy: "Copy",
    copied: "Copied!",
    hint: "Tip: tell your friend the shift number so they can decode it.",
    note: "Shifts the 26-letter alphabet A–Z. Spaces and punctuation stay the same.",
    placeholderEncode: "Meet at the treehouse",
    placeholderDecode: "Phhw dw wkh wuhhkrxvh",
  },
  hr: {
    encode: "Šifriraj",
    decode: "Dešifriraj",
    message: "Vaša poruka",
    cipher: "Tajna poruka",
    shift: "Ključ (pomak)",
    copy: "Kopiraj",
    copied: "Kopirano!",
    hint: "Savjet: recite prijatelju ključ (pomak) kako bi mogao dešifrirati poruku.",
    note: "Koristi punu hrvatsku abecedu od 30 slova — uključujući dž, lj i nj kao zasebna slova — bez q, w, x, y.",
    placeholderEncode: "Nađimo se kod kućice na drvetu",
    placeholderDecode: "Qdđlpr vh nrg nxćlfh qd guyhwx",
  },
} as const;

// Per-language alphabet. Croatian (gajica) is 30 letters: the diacritic letters
// (č, ć, đ, š, ž) AND the digraphs dž, lj, nj as single letters (placed after
// d, l, n) — and it has no q, w, x, y. The shift wraps within whichever alphabet.
const ALPHABETS: Record<Lang, string[]> = {
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  hr: "A B C Č Ć D DŽ Đ E F G H I J K L LJ M N NJ O P R S Š T U V Z Ž".split(" "),
};

/**
 * Caesar shift within `alphabet` (wrapping). Multi-character letters (the
 * Croatian digraphs dž/lj/nj) are matched greedily as single letters, so a
 * shift can turn a digraph into a single letter or vice-versa. Characters not
 * in the alphabet — spaces, punctuation, digits, and q/w/x/y in Croatian —
 * pass through unchanged. Case is preserved, including title-case digraphs ("Lj").
 */
function caesar(text: string, shift: number, alphabet: string[]): string {
  const len = alphabet.length;
  const index = new Map(alphabet.map((tok, i) => [tok, i]));
  const digraphs = new Set(alphabet.filter((tok) => [...tok].length > 1));
  const s = ((shift % len) + len) % len;
  const chars = [...text];
  let out = "";

  for (let i = 0; i < chars.length; ) {
    let token = chars[i];
    if (i + 1 < chars.length && digraphs.has((chars[i] + chars[i + 1]).toUpperCase())) {
      token = chars[i] + chars[i + 1];
    }
    const canonical = token.toUpperCase();
    const idx = index.get(canonical);
    if (idx === undefined) {
      out += chars[i];
      i += 1;
      continue;
    }
    const result = alphabet[(idx + s) % len];
    const tokenLen = [...token].length;
    const firstUpper = token[0] === canonical[0];
    if (!firstUpper) {
      out += result.toLowerCase();
    } else if ([...result].length === 1) {
      out += result;
    } else {
      // Result is a digraph — pick ALL-CAPS vs Title so both round-trip: a
      // genuine all-caps source digraph, or a single capital whose neighbour is
      // also uppercase, renders all-caps; otherwise title-case ("Lj").
      const sourceAllCaps = token === canonical && tokenLen > 1;
      const next = chars[i + tokenLen];
      const nextUpper = !!next && next === next.toUpperCase() && next !== next.toLowerCase();
      out +=
        sourceAllCaps || (tokenLen === 1 && nextUpper)
          ? result
          : result[0] + result.slice(1).toLowerCase();
    }
    i += tokenLen;
  }
  return out;
}

export default function CaesarCipher({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const alphabet = ALPHABETS[lang];
  const maxShift = alphabet.length - 1;
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [text, setText] = useState<string>(t.placeholderEncode);
  const [shift, setShift] = useState(3);
  const [copied, setCopied] = useState(false);

  const output = caesar(text, mode === "encode" ? shift : -shift, alphabet);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  const tab = (m: "encode" | "decode", label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      aria-pressed={mode === m}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        mode === m ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <div className="flex gap-2">
        {tab("encode", t.encode)}
        {tab("decode", t.decode)}
      </div>

      <label htmlFor="caesar-text" className="mt-4 block text-sm font-medium text-gray-600">
        {mode === "encode" ? t.message : t.cipher}
      </label>
      <textarea
        id="caesar-text"
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
      />

      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="caesar-shift" className="text-sm font-medium text-gray-600">
          {t.shift}
        </label>
        <input
          id="caesar-shift"
          type="range"
          min={1}
          max={maxShift}
          step={1}
          value={shift}
          onChange={(e) => setShift(Number(e.target.value))}
          className="flex-1 accent-brand"
        />
        <span className="w-14 text-center font-mono text-sm font-semibold text-gray-800">
          {alphabet[0]}→{alphabet[shift % alphabet.length]}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            {mode === "encode" ? t.cipher : t.message}
          </span>
          <button
            type="button"
            onClick={copy}
            className="text-xs font-semibold text-brand hover:text-brand-hover"
          >
            {copied ? t.copied : t.copy}
          </button>
        </div>
        <output className="block min-h-[3rem] break-words rounded-lg bg-brand-soft px-3 py-2 font-mono text-[15px] text-gray-800">
          {output}
        </output>
      </div>

      <p className="mt-3 text-xs text-gray-400">{t.hint}</p>
      <p className="mt-1 text-xs text-gray-400">{t.note}</p>
    </div>
  );
}
