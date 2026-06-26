"use client";

import { useEffect, useRef, useState } from "react";

type Lang = "en" | "hr";

const COPY = {
  en: {
    toMorse: "Text → Morse",
    toText: "Morse → Text",
    text: "Your message",
    morse: "Morse code",
    play: "▶ Play",
    stop: "■ Stop",
    slow: "🐢 Slow",
    copy: "Copy",
    copied: "Copied!",
    morseHint: "Use · and − (or . and -). Space between letters, / between words.",
    note: "International Morse covers A–Z, 0–9 and punctuation. Croatian accents (č, š, ž…) are sent as their base letters — Morse has no separate codes for them.",
    placeholder: "SOS help",
    placeholderMorse: "... --- ...",
  },
  hr: {
    toMorse: "Tekst → Morse",
    toText: "Morse → Tekst",
    text: "Vaša poruka",
    morse: "Morseov kod",
    play: "▶ Sviraj",
    stop: "■ Stop",
    slow: "🐢 Sporo",
    copy: "Kopiraj",
    copied: "Kopirano!",
    morseHint: "Koristite · i − (ili . i -). Razmak između slova, / između riječi.",
    note: "Međunarodni Morseov kod pokriva A–Ž (bez kvačica), 0–9 i interpunkciju. Hrvatska slova s kvačicama (č, š, ž…) šalju se kao osnovna slova — Morse za njih nema zasebne kodove.",
    placeholder: "SOS pomoć",
    placeholderMorse: "... --- ...",
  },
} as const;

// International Morse code. Letters A–Z, digits, and common punctuation.
const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.",
  H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.",
  O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-",
  V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
  '"': ".-..-.", "@": ".--.-.",
};
const TEXT: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k])
);

// Fold diacritics to base letters (Č→C, Đ→D) so Croatian words still encode.
// Đ/đ don't decompose under NFD, so map them explicitly first.
function fold(s: string): string {
  return s
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Encode plain text → Morse. Letters joined by " ", words by " / ".
function encode(text: string): string {
  return fold(text)
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      [...word]
        .map((ch) => MORSE[ch] ?? "")
        .filter(Boolean)
        .join(" ")
    )
    .filter(Boolean)
    .join(" / ");
}

// Decode Morse → text. Accepts ./- or ·/−, "/" (or 2+ spaces) as word breaks.
function decode(morse: string): string {
  const normalized = morse.replace(/·/g, ".").replace(/[−–—]/g, "-");
  return normalized
    .trim()
    .split(/\s*\/\s*|\s{2,}/)
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((sym) => TEXT[sym] ?? "")
        .join("")
    )
    .filter(Boolean)
    .join(" ");
}

// Flatten a Morse string into playback segments: each beep (dit/dah) plus the
// gaps between symbols, letters and words, measured in Morse "units".
//   dit = 1, dah = 3 · intra-letter gap = 1 · letter gap = 3 · word gap = 7
type Seg = { on: boolean; units: number };
function toSegments(morse: string): Seg[] {
  const segs: Seg[] = [];
  const symbols = [...morse];
  for (let i = 0; i < symbols.length; i++) {
    const c = symbols[i];
    if (c === "." || c === "·") segs.push({ on: true, units: 1 });
    else if (c === "-" || c === "−") segs.push({ on: true, units: 3 });
    else if (c === " ") segs.push({ on: false, units: 3 }); // letter gap (net)
    else if (c === "/") segs.push({ on: false, units: 7 }); // word gap (net)
    else continue;
    // intra-letter gap after a beep, unless the next symbol is itself a gap
    if (segs[segs.length - 1].on) {
      const next = symbols[i + 1];
      if (next === "." || next === "-" || next === "·" || next === "−") {
        segs.push({ on: false, units: 1 });
      }
    }
  }
  return segs;
}

export default function MorseCode({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [mode, setMode] = useState<"toMorse" | "toText">("toMorse");
  const [input, setInput] = useState<string>(t.placeholder);
  const [slow, setSlow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [lit, setLit] = useState(false);
  const [copied, setCopied] = useState(false);

  // Web Audio + timers kept in refs so Stop / unmount can cancel cleanly.
  const audioRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<number[]>([]);

  const morse = mode === "toMorse" ? encode(input) : input;
  const output = mode === "toMorse" ? morse : decode(input);

  const stop = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (audioRef.current) {
      audioRef.current.close().catch(() => {});
      audioRef.current = null;
    }
    setPlaying(false);
    setLit(false);
  };

  // Cancel any audio if the component unmounts mid-playback.
  useEffect(() => stop, []);

  const play = () => {
    stop();
    const segs = toSegments(morse);
    if (!segs.length) return;

    const unit = slow ? 160 : 90; // ms per Morse unit
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctor();
    audioRef.current = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 600;
    gain.gain.value = 0;
    osc.connect(gain).connect(ctx.destination);
    osc.start();

    setPlaying(true);
    let tMs = 0; // running offset in ms from now
    for (const seg of segs) {
      const dur = (seg.units * unit) / 1000;
      const at = ctx.currentTime + tMs / 1000;
      if (seg.on) {
        // tiny ramps avoid clicks at beep edges
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.25, at + 0.005);
        gain.gain.setValueAtTime(0.25, at + dur - 0.005);
        gain.gain.linearRampToValueAtTime(0, at + dur);
        // drive the visual lamp in lock-step with the beep
        timersRef.current.push(
          window.setTimeout(() => setLit(true), tMs),
          window.setTimeout(() => setLit(false), tMs + seg.units * unit)
        );
      }
      tMs += seg.units * unit;
    }
    // end of sequence: stop the oscillator and reset state
    timersRef.current.push(
      window.setTimeout(() => {
        osc.stop();
        stop();
      }, tMs + 60)
    );
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  const tab = (m: "toMorse" | "toText", label: string) => (
    <button
      type="button"
      onClick={() => {
        stop();
        setMode(m);
        setInput(m === "toMorse" ? t.placeholder : t.placeholderMorse);
      }}
      aria-pressed={mode === m}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        mode === m ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  // Render the Morse string as visual dots/dashes, grouped per letter.
  const letters = morse.split(/\s+/).filter((x) => x && x !== "/");

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <div className="flex gap-2">
        {tab("toMorse", t.toMorse)}
        {tab("toText", t.toText)}
      </div>

      <label htmlFor="morse-input" className="mt-4 block text-sm font-medium text-gray-600">
        {mode === "toMorse" ? t.text : t.morse}
      </label>
      <textarea
        id="morse-input"
        rows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="mt-1 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand"
      />
      {mode === "toText" && <p className="mt-1 text-xs text-gray-400">{t.morseHint}</p>}

      {/* Visual dot/dash rendering of the Morse, with a synced lamp */}
      {mode === "toMorse" && letters.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`h-6 w-6 flex-shrink-0 rounded-full transition-all duration-75 ${
              lit ? "bg-amber-400 shadow-[0_0_12px_4px_rgba(251,191,36,0.7)]" : "bg-gray-200"
            }`}
          />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {letters.map((code, i) => (
              <span key={i} className="flex items-center gap-1">
                {[...code].map((sym, j) =>
                  sym === "-" || sym === "−" ? (
                    <span key={j} className="h-2 w-4 rounded-full bg-brand" />
                  ) : (
                    <span key={j} className="h-2 w-2 rounded-full bg-brand" />
                  )
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            {mode === "toMorse" ? t.morse : t.text}
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

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={playing ? stop : play}
          disabled={!morse}
          className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          {playing ? t.stop : t.play}
        </button>
        <button
          type="button"
          onClick={() => setSlow((v) => !v)}
          aria-pressed={slow}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            slow ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t.slow}
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-400">{t.note}</p>
    </div>
  );
}
