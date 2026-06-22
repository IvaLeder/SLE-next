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
    placeholderEncode: "Nađimo se kod kućice na drvetu",
    placeholderDecode: "Qdđlpr vh nrg nxćlfh qd guyhwx",
  },
} as const;

/** Shift A–Z and a–z by `shift` (wrapping); leave everything else unchanged. */
function caesar(text: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return text.replace(/[a-z]/gi, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base);
  });
}

export default function CaesarCipher({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [text, setText] = useState<string>(t.placeholderEncode);
  const [shift, setShift] = useState(3);
  const [copied, setCopied] = useState(false);

  const output = caesar(text, mode === "encode" ? shift : -shift);

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
          max={25}
          step={1}
          value={shift}
          onChange={(e) => setShift(Number(e.target.value))}
          className="flex-1 accent-brand"
        />
        <span className="w-12 text-center font-mono text-sm font-semibold text-gray-800">
          A→{String.fromCharCode(65 + (shift % 26))}
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
    </div>
  );
}
