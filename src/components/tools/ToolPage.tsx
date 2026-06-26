import Link from "next/link";
import { TOOLS_SLUG, type Tool, type Lang } from "@/lib/tools";
import NameInBinary from "@/components/tools/NameInBinary";
import CaesarCipher from "@/components/tools/CaesarCipher";
import TowerOfHanoi from "@/components/tools/TowerOfHanoi";
import SpinActivity from "@/components/tools/SpinActivity";
import FractionVisualizer from "@/components/tools/FractionVisualizer";
import FindBirthdayInPi from "@/components/tools/FindBirthdayInPi";
import MorseCode from "@/components/tools/MorseCode";
import { getSpinActivities } from "@/lib/spin-activities";

// Maps a tool's `key` to its interactive UI. Add new tools here. (The activity
// spinner is special-cased below because it needs a server-fetched post list.)
const TOOL_UI: Record<string, React.ComponentType<{ lang: Lang }>> = {
  "name-in-binary": NameInBinary,
  "caesar-cipher": CaesarCipher,
  "tower-of-hanoi": TowerOfHanoi,
  "fraction-visualizer": FractionVisualizer,
  "find-birthday-in-pi": FindBirthdayInPi,
  "morse-code": MorseCode,
};

const COPY = {
  en: { back: "All tools", related: "Want the why behind it?" },
  hr: { back: "Svi alati", related: "Želite znati kako to radi?" },
} as const;

export default function ToolPage({ lang, tool }: { lang: Lang; tool: Tool }) {
  const t = COPY[lang];
  const Comp = TOOL_UI[tool.key];

  return (
    <div>
      <nav className="mb-4 font-sans text-sm">
        <Link href={`/${lang}/${TOOLS_SLUG[lang]}`} className="text-gray-500 hover:text-[#FB6F52]">
          ← {t.back}
        </Link>
      </nav>

      <div className="flex items-start gap-3">
        <span className="text-4xl" aria-hidden="true">{tool.icon}</span>
        <div>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">{tool.title[lang]}</h1>
          <p className="mt-2 text-lg leading-relaxed text-gray-700">{tool.tagline[lang]}</p>
        </div>
      </div>

      <div className="mt-6">
        {tool.key === "activity-spinner" ? (
          <SpinActivity lang={lang} activities={getSpinActivities(lang)} />
        ) : (
          Comp && <Comp lang={lang} />
        )}
      </div>

      {tool.related && (
        <div className="mt-8 rounded-2xl bg-orange-50 p-5">
          <p className="font-sans font-semibold text-gray-800">{t.related}</p>
          <Link
            href={`/${lang}/${tool.related.slug[lang]}`}
            className="mt-1 inline-block font-sans text-sm font-semibold text-[#FB6F52] hover:underline"
          >
            {tool.related.label[lang]} →
          </Link>
        </div>
      )}
    </div>
  );
}
