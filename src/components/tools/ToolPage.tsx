import Link from "next/link";
import { TOOLS_SLUG, type Tool, type Lang } from "@/lib/tools";
import Printable from "@/components/mdx/Printable";
import NameInBinary from "@/components/tools/NameInBinary";
import CaesarCipher from "@/components/tools/CaesarCipher";
import TowerOfHanoi from "@/components/tools/TowerOfHanoi";
import SpinActivity from "@/components/tools/SpinActivity";
import FractionVisualizer from "@/components/tools/FractionVisualizer";
import FindBirthdayInPi from "@/components/tools/FindBirthdayInPi";
import MorseCode from "@/components/tools/MorseCode";
import ClockTool from "@/components/tools/ClockTool";
import DevelopmentalLeaps from "@/components/tools/DevelopmentalLeaps";
import PatternMaker from "@/components/tools/PatternMaker";
import ColorMixer from "@/components/tools/ColorMixer";
import NumberSystems from "@/components/tools/NumberSystems";
import WeightOnPlanets from "@/components/tools/WeightOnPlanets";
import PrimeExplorer from "@/components/tools/PrimeExplorer";
import GuessMyNumber from "@/components/tools/GuessMyNumber";
import ToolFrame from "@/components/tools/ToolFrame";
import ToolPageAnalytics from "@/components/tools/ToolPageAnalytics";
import { ToolRecommendations } from "@/components/tools/ToolDiscovery";
import ToolGuide from "@/components/tools/ToolGuide";
import JsonLd from "@/components/JsonLd";
import { getSpinActivities } from "@/lib/spin-activities";
import { getToolContent } from "@/lib/tool-content";
import { siteConfig } from "@/config/site";

// Maps a tool's `key` to its interactive UI. Add new tools here. (The activity
// spinner is special-cased below because it needs a server-fetched post list.)
const TOOL_UI: Record<string, React.ComponentType<{ lang: Lang }>> = {
  "name-in-binary": NameInBinary,
  "caesar-cipher": CaesarCipher,
  "tower-of-hanoi": TowerOfHanoi,
  "fraction-visualizer": FractionVisualizer,
  "find-birthday-in-pi": FindBirthdayInPi,
  "morse-code": MorseCode,
  "clock": ClockTool,
  "developmental-leaps": DevelopmentalLeaps,
  "pattern-maker": PatternMaker,
  "color-mixer": ColorMixer,
  "number-systems": NumberSystems,
  "weight-on-planets": WeightOnPlanets,
  "prime-explorer": PrimeExplorer,
  "guess-my-number": GuessMyNumber,
  "truss-tester": TrussTester,
};

const COPY = {
  en: { back: "All tools", related: "Want the why behind it?" },
  hr: { back: "Svi alati", related: "Želite znati kako to radi?" },
} as const;

export default function ToolPage({ lang, tool }: { lang: Lang; tool: Tool }) {
  const t = COPY[lang];
  const Comp = TOOL_UI[tool.key];
  const content = getToolContent(tool.key);
  const toolUrl = `${siteConfig.url}/${lang}/${TOOLS_SLUG[lang]}/${tool.slug[lang]}`;
  const hubUrl = `${siteConfig.url}/${lang}/${TOOLS_SLUG[lang]}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${toolUrl}#application`,
        name: tool.title[lang],
        description: tool.description[lang],
        url: toolUrl,
        inLanguage: lang,
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "Interactive learning tool",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and a modern web browser",
        isAccessibleForFree: true,
        isFamilyFriendly: true,
        ...(content && { featureList: content.learns[lang] }),
        ...(tool.related && {
          isBasedOn: `${siteConfig.url}/${lang}/${tool.related.slug[lang]}`,
        }),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
        author: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${toolUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: lang === "en" ? "Home" : "Naslovnica",
            item: `${siteConfig.url}/${lang}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: lang === "en" ? "Tools & games" : "Alati i igre",
            item: hubUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.title[lang],
            item: toolUrl,
          },
        ],
      },
    ],
  };

  return (
    <ToolPageAnalytics lang={lang} toolKey={tool.key}>
      <JsonLd data={structuredData} />
      <nav className="mb-4 font-sans text-sm">
        <Link href={`/${lang}/${TOOLS_SLUG[lang]}`} className="text-gray-500 hover:text-brand">
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
        <ToolFrame lang={lang} toolKey={tool.key} title={tool.title[lang]}>
          <div data-tool-interactive>
            {tool.key === "activity-spinner" ? (
              <SpinActivity lang={lang} activities={getSpinActivities(lang)} />
            ) : (
              Comp && <Comp lang={lang} />
            )}
          </div>
        </ToolFrame>
      </div>

      {content && <ToolGuide lang={lang} content={content} />}

      {tool.download && (
        <Printable
          lang={lang}
          id={tool.download.id}
          href={tool.download.href[lang]}
          title={tool.download.title[lang]}
          pages={tool.download.pages}
          size={tool.download.size[lang]}
        />
      )}

      {tool.related && (
        <div className="mt-8 rounded-2xl bg-brand-soft p-5">
          <p className="font-sans font-semibold text-gray-800">{t.related}</p>
          <Link
            data-tool-related
            href={`/${lang}/${tool.related.slug[lang]}`}
            className="mt-1 inline-block font-sans text-sm font-semibold text-brand hover:underline"
          >
            {tool.related.label[lang]} →
          </Link>
        </div>
      )}

      <ToolRecommendations lang={lang} toolKey={tool.key} />
    </ToolPageAnalytics>
  );
}
