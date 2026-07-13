import React from "react";

type Lang = "en" | "hr";
type CalloutType = "info" | "warning" | "success" | "safety" | "science" | "tip";

const STYLES: Record<CalloutType, string> = {
  info: "bg-blue-50 border-blue-300 text-blue-900",
  warning: "bg-yellow-50 border-yellow-300 text-yellow-900",
  success: "bg-green-50 border-green-300 text-green-900",
  safety: "bg-red-50 border-red-300 text-red-900",
  science: "bg-purple-50 border-purple-300 text-purple-900",
  tip: "bg-teal-50 border-teal-300 text-teal-900",
};

// Default headings when the author doesn't pass `title`. `lang` is injected by
// the MDX components factory, so HR articles get HR defaults automatically.
const TITLES: Record<Lang, Record<CalloutType, string>> = {
  en: {
    info: "💡 Did you know?",
    warning: "⚠️ Warning",
    success: "✅ Good to know",
    safety: "👨‍👧 Adult supervision needed",
    science: "🔬 The science behind it",
    tip: "✨ Pro tip",
  },
  hr: {
    info: "💡 Jeste li znali?",
    warning: "⚠️ Upozorenje",
    success: "✅ Dobro je znati",
    safety: "👨‍👧 Potreban nadzor odraslih",
    science: "🔬 Zašto se to događa?",
    tip: "✨ Savjet",
  },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  lang?: Lang;
  children: React.ReactNode;
}

export function Callout({
  type = "info",
  title,
  lang = "en",
  children,
}: CalloutProps) {
  return (
    // `data-callout` lets the Mind Explorers theme scope retint the box to the
    // plum/gold palette (see globals.css); off-theme it's inert and the STEM
    // semantic colours below apply as normal.
    <div data-callout={type} className={`border-l-4 p-4 my-6 rounded ${STYLES[type]}`}>
      <div className="flex items-center gap-2 mb-2 font-semibold">
        <h4 className="text-sm font-bold leading-none">
          {title ?? TITLES[lang][type]}
        </h4>
      </div>

      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
