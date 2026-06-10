"use client";

import { useState } from "react";

type Props = {
  url: string;
  title: string;
  image?: string;
  lang: "en" | "hr";
};

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.4v7A10 10 0 0 0 22 12Z"/>
    </svg>
  );
}
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.2 2H21l-6.6 7.6L22.2 22h-6.1l-4.8-6.3L5.6 22H2.8l7.1-8.1L1.8 2h6.2l4.3 5.7L18.2 2Zm-1 18.4h1.7L7.1 3.6H5.3l11.9 16.8Z"/>
    </svg>
  );
}
function PinterestIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5.1s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.3-.9 3.5-.3 1.1.5 2 1.6 2 1.9 0 3.4-2 3.4-5 0-2.6-1.9-4.4-4.5-4.4-3.1 0-4.9 2.3-4.9 4.7 0 .9.3 1.9.8 2.5.1.1.1.2.1.3l-.3 1.3c0 .2-.2.3-.4.2-1.5-.7-2.4-2.9-2.4-4.6 0-3.8 2.7-7.2 7.8-7.2 4.1 0 7.3 2.9 7.3 6.8 0 4.1-2.6 7.4-6.2 7.4-1.2 0-2.4-.6-2.7-1.4l-.7 2.8c-.3 1-1 2.3-1.5 3a10 10 0 0 0 13-9.5A10 10 0 0 0 12 2Z"/>
    </svg>
  );
}
function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/>
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>
    </svg>
  );
}
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 13l4 4L19 7"/>
    </svg>
  );
}

export default function ShareButtons({ url, title, image, lang }: Props) {
  const [copied, setCopied] = useState(false);

  const t = {
    en: { heading: "Share this article", facebook: "Share on Facebook", x: "Share on X", pinterest: "Pin on Pinterest", copy: "Copy link", copied: "Link copied" },
    hr: { heading: "Podijeli ovaj članak", facebook: "Podijeli na Facebooku", x: "Podijeli na X-u", pinterest: "Spremi na Pinterest", copy: "Kopiraj poveznicu", copied: "Poveznica kopirana" },
  }[lang];

  const enc = encodeURIComponent;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
  const xHref  = `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`;
  const piHref = `https://pinterest.com/pin/create/button/?url=${enc(url)}&description=${enc(title)}${image ? `&media=${enc(image)}` : ""}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* swallow — older browsers without Clipboard API */
    }
  };

  const btn = "w-9 h-9 inline-flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-400 transition";

  return (
    <div data-no-print className="mt-10 pt-6 border-t flex items-center gap-3 flex-wrap font-sans">
      <span className="text-sm font-semibold text-gray-700 mr-1">{t.heading}:</span>

      <a href={fbHref} target="_blank" rel="noopener noreferrer" aria-label={t.facebook} className={btn}>
        <FacebookIcon className="w-4 h-4" />
      </a>
      <a href={xHref} target="_blank" rel="noopener noreferrer" aria-label={t.x} className={btn}>
        <XIcon className="w-4 h-4" />
      </a>
      <a href={piHref} target="_blank" rel="noopener noreferrer" aria-label={t.pinterest} className={btn}>
        <PinterestIcon className="w-4 h-4" />
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? t.copied : t.copy}
        className={btn}
        title={copied ? t.copied : t.copy}
      >
        {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <LinkIcon className="w-4 h-4" />}
      </button>

      {/* Persistent live region — if it only mounted on copy, screen readers
          could miss the announcement entirely. */}
      <span className="text-xs text-green-700" role="status" aria-live="polite">
        {copied ? t.copied : ""}
      </span>
    </div>
  );
}
