"use client";

import React, { useState } from "react";

interface TermProps {
  /** Kid-friendly definition shown in the tooltip. */
  def: string;
  children: React.ReactNode;
}

/**
 * Inline glossary term with a tap/hover definition:
 *
 *   The steam <Term def="Water vapor turning back into liquid water.">condenses</Term> instantly.
 *
 * Dotted underline distinguishes it from links. In print the tooltip can't
 * open, so the definition is inlined in parentheses instead.
 */
export default function Term({ def, children }: TermProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="cursor-help border-b-2 border-dotted border-brand print:border-none"
      >
        {children}
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-10 mb-2 block w-56 -translate-x-1/2 rounded-xl bg-gray-900 px-3 py-2 text-center font-sans text-xs font-normal leading-relaxed text-white shadow-lg"
        >
          {def}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900"
          />
        </span>
      )}

      {/* print fallback — tooltips don't exist on paper */}
      <span className="hidden print:inline"> ({def})</span>
    </span>
  );
}
