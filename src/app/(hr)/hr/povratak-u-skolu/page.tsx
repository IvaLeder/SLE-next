import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import BackToSchoolLanding from "@/components/BackToSchoolLanding";
import { siteConfig } from "@/config/site";
import { BACK_TO_SCHOOL_SLUG } from "@/lib/back-to-school";

const url = `${siteConfig.url}/hr/${BACK_TO_SCHOOL_SLUG.hr}`;
const enUrl = `${siteConfig.url}/en/${BACK_TO_SCHOOL_SLUG.en}`;

export const metadata: Metadata = {
  title: "Povratak u školu: mirne rutine, spremnost i učenje | STEM Little Explorers",
  description:
    "Praktičan vodič za roditelje i odgojno-obrazovne djelatnike: spremnost za školu, mirnije rutine, provjere osjećaja, paket od 8 stranica i pomoć pri učenju množenja.",
  alternates: {
    canonical: url,
    languages: { en: enUrl, hr: url },
  },
  openGraph: {
    title: "Znatiželjno, mirno i spremno za učenje",
    description:
      "Nježniji vodič za početak škole sa spremnošću, mirnijim rutinama, pomoći pri učenju i besplatnim paketom od 8 stranica.",
    url,
    type: "website",
  },
};

const items = [
  ["Je li moje dijete spremno za školu? Više od slova i brojeva", "spremnost-za-skolu-vise-od-slova-i-brojeva"],
  ["Znatiželjno i mirno: nježan plan za početak škole", "znatizeljno-i-mirno-povratak-u-skolu"],
  ["Kako naučiti tablicu množenja: 12 lakih trikova za djecu", "kako-nauciti-tablicu-mnozenja"],
] as const;

export default function BackToSchoolPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Znatiželjno, mirno i spremno za učenje",
    description: metadata.description,
    url,
    inLanguage: "hr",
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map(([name, slug], index) => ({
        "@type": "ListItem",
        position: index + 1,
        name,
        url: `${siteConfig.url}/hr/${slug}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <Header lang="hr" switchUrl={`/en/${BACK_TO_SCHOOL_SLUG.en}`} />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10">
        <BackToSchoolLanding lang="hr" />
      </main>
      <Footer lang="hr" />
    </>
  );
}
