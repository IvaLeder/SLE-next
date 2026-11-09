import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import AdventLanding, { getAdventPosts } from "@/components/AdventLanding";
import { siteConfig } from "@/config/site";
import { ADVENT } from "@/lib/seasonal";

const url = `${siteConfig.url}/hr/${ADVENT.slug.hr}`;
const enUrl = `${siteConfig.url}/en/${ADVENT.slug.en}`;

export const metadata: Metadata = {
  title: "Adventski kalendar za djecu: 24 božićna pokusa | STEM Little Explorers",
  description:
    "Besplatni STEM adventski kalendar: 24 dana jednostavnih božićnih pokusa za djecu, od umjetnog snijega i pahulja do snježnih kugli i ukrasa od slanog tijesta.",
  alternates: {
    canonical: url,
    languages: { en: enUrl, hr: url },
  },
  openGraph: {
    title: "STEM adventski kalendar: 24 dana božićne znanosti",
    description:
      "Iza svakih vrata mali pokus: umjetni snijeg, pahulje sa šest krakova, snježne kugle i ukrasi, a u svemu prava znanost. Besplatno za ispis.",
    url,
    type: "website",
  },
};

export default function AdventPage() {
  const posts = getAdventPosts("hr");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "STEM adventski kalendar",
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
      <Header lang="hr" switchUrl={`/en/${ADVENT.slug.en}`} />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10">
        <AdventLanding lang="hr" />
      </main>
      <Footer lang="hr" />
    </>
  );
}
