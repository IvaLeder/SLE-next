import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import AdventLanding, { getAdventPosts } from "@/components/AdventLanding";
import { siteConfig } from "@/config/site";
import { ADVENT } from "@/lib/seasonal";

const url = `${siteConfig.url}/en/${ADVENT.slug.en}`;
const hrUrl = `${siteConfig.url}/hr/${ADVENT.slug.hr}`;

export const metadata: Metadata = {
  title: "STEM Advent Calendar: 24 Christmas Science Activities for Kids | STEM Little Explorers",
  description:
    "A free STEM advent calendar: 24 days of easy Christmas science for kids, from fake snow and paper snowflakes to snow globes and salt dough ornaments.",
  alternates: {
    canonical: url,
    languages: { en: url, hr: hrUrl },
  },
  openGraph: {
    title: "The STEM Advent Calendar: 24 days of Christmas science",
    description:
      "One small experiment behind every door: fake snow, six-armed snowflakes, snow globes and ornaments, with real science inside. Free printable.",
    url,
    type: "website",
  },
};

export default function AdventPage() {
  const posts = getAdventPosts("en");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "The STEM Advent Calendar",
    description: metadata.description,
    url,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: post.title,
        url: `${siteConfig.url}/en/${post.slug}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <Header lang="en" switchUrl={`/hr/${ADVENT.slug.hr}`} />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10">
        <AdventLanding lang="en" />
      </main>
      <Footer lang="en" />
    </>
  );
}
