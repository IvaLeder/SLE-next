import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import PumpkinsLanding, { getPumpkinsPosts } from "@/components/PumpkinsLanding";
import { siteConfig } from "@/config/site";
import { PUMPKINS } from "@/lib/seasonal";

const url = `${siteConfig.url}/en/${PUMPKINS.slug.en}`;
const hrUrl = `${siteConfig.url}/hr/${PUMPKINS.slug.hr}`;

export const metadata: Metadata = {
  title: "Halloween & Fall Science Experiments for Kids | STEM Little Explorers",
  description:
    "Pumpkins & Potions: slime, oobleck, bubbling cauldrons, glowing eggs and autumn science for kids. Easy kitchen experiments, each rated by how spooky it is.",
  alternates: {
    canonical: url,
    languages: { en: url, hr: hrUrl },
  },
  openGraph: {
    title: "Pumpkins & Potions: an autumn science lab for kids",
    description:
      "Gooey slime, bubbling cauldrons and glowing eyeballs, plus the real science of autumn. Friendly experiments with kitchen ingredients.",
    url,
    type: "website",
  },
};

export default function PumpkinsPage() {
  const posts = getPumpkinsPosts("en");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Pumpkins & Potions",
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
      <Header lang="en" switchUrl={`/hr/${PUMPKINS.slug.hr}`} />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10">
        <PumpkinsLanding lang="en" />
      </main>
      <Footer lang="en" />
    </>
  );
}
