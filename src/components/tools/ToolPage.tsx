import Link from "next/link";
import { TOOLS_SLUG, type Tool, type Lang } from "@/lib/tools";
import { MINDS_SLUG } from "@/lib/minds";
import Printable from "@/components/mdx/Printable";
import {
  NameInBinary,
  CaesarCipher,
  TowerOfHanoi,
  SpinActivity,
  FractionVisualizer,
  MultiplicationVisualizer,
  FindBirthdayInPi,
  MorseCode,
  ClockTool,
  DevelopmentalLeaps,
  PatternMaker,
  ColorMixer,
  NumberSystems,
  WeightOnPlanets,
  PrimeExplorer,
  GuessMyNumber,
  TrussTester,
} from "@/components/tools/LazyToolUi";
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
const TOOL_UI: Record<string, React.ComponentType<{ lang?: Lang }>> = {
  "name-in-binary": NameInBinary,
  "caesar-cipher": CaesarCipher,
  "tower-of-hanoi": TowerOfHanoi,
  "fraction-visualizer": FractionVisualizer,
  "multiplication-visualizer": MultiplicationVisualizer,
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
  en: { back: "All tools", mindsBack: "Mind Explorers", related: "Want the why behind it?" },
  hr: { back: "Svi alati", mindsBack: "Mind Explorers", related: "Želite znati kako to radi?" },
} as const;

export default function ToolPage({ lang, tool }: { lang: Lang; tool: Tool }) {
  const t = COPY[lang];
  const Comp = TOOL_UI[tool.key];
  const content = getToolContent(tool.key);
  const toolUrl = `${siteConfig.url}/${lang}/${TOOLS_SLUG[lang]}/${tool.slug[lang]}`;
  const isMindsTool = tool.key === "developmental-leaps";
  const hubPath = isMindsTool ? `/${lang}/${MINDS_SLUG[lang]}` : `/${lang}/${TOOLS_SLUG[lang]}`;
  const hubUrl = `${siteConfig.url}${hubPath}`;
  const hubLabel = isMindsTool ? t.mindsBack : t.back;
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
            name: isMindsTool
              ? "Mind Explorers"
              : lang === "en"
                ? "Tools & games"
                : "Alati i igre",
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
        <Link href={hubPath} className="text-gray-500 hover:text-brand">
          ← {hubLabel}
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
          source="tool"
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
