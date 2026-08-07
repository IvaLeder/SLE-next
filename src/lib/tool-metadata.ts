import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { TOOLS_SLUG, type Lang, type Tool } from "@/lib/tools";

export function generateToolMetadata(tool: Tool, lang: Lang): Metadata {
  const title = `${tool.title[lang]} | STEM Little Explorers`;
  const description = tool.description[lang];
  const url = `${siteConfig.url}/${lang}/${TOOLS_SLUG[lang]}/${tool.slug[lang]}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteConfig.url}/en/${TOOLS_SLUG.en}/${tool.slug.en}`,
        hr: `${siteConfig.url}/hr/${TOOLS_SLUG.hr}/${tool.slug.hr}`,
        "x-default": `${siteConfig.url}/en/${TOOLS_SLUG.en}/${tool.slug.en}`,
      },
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: siteConfig.name,
      locale: lang === "en" ? "en_US" : "hr_HR",
      alternateLocale: lang === "en" ? ["hr_HR"] : ["en_US"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
