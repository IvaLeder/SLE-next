import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import PumpkinsLanding, { getPumpkinsPosts } from "@/components/PumpkinsLanding";
import { siteConfig } from "@/config/site";
import { PUMPKINS } from "@/lib/seasonal";

const url = `${siteConfig.url}/hr/${PUMPKINS.slug.hr}`;
const enUrl = `${siteConfig.url}/en/${PUMPKINS.slug.en}`;

export const metadata: Metadata = {
  title: "Jesenski pokusi za djecu: sluz, napici i Noć vještica | STEM Little Explorers",
  description:
    "Bundeve i čarobni napici: slime, oobleck, kotlići koji kipe, jaje koje svijetli i jesenska znanost. Jednostavni pokusi sa sastojcima iz kuhinje.",
  alternates: {
    canonical: url,
    languages: { en: enUrl, hr: url },
  },
  openGraph: {
    title: "Bundeve i čarobni napici: jesenski znanstveni laboratorij",
    description:
      "Ljepljiva sluz, kotlići koji kipe i oči koje svijetle, uz pravu znanost jeseni. Prijateljski pokusi sa sastojcima iz kuhinje.",
    url,
    type: "website",
  },
};

export default function PumpkinsPage() {
  const posts = getPumpkinsPosts("hr");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Bundeve i čarobni napici",
    description: metadata.description,
    url,
    inLanguage: "hr",
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: post.title,
        url: `${siteConfig.url}/hr/${post.slug}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <Header lang="hr" switchUrl={`/en/${PUMPKINS.slug.en}`} />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10">
        <PumpkinsLanding lang="hr" />
      </main>
      <Footer lang="hr" />
    </>
  );
}
