import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import BackToSchoolLanding from "@/components/BackToSchoolLanding";
import { siteConfig } from "@/config/site";
import { BACK_TO_SCHOOL_SLUG } from "@/lib/back-to-school";

const url = `${siteConfig.url}/en/${BACK_TO_SCHOOL_SLUG.en}`;
const hrUrl = `${siteConfig.url}/hr/${BACK_TO_SCHOOL_SLUG.hr}`;

export const metadata: Metadata = {
  title: "Back-to-School Guide: Calm Routines, Readiness & Learning | STEM Little Explorers",
  description:
    "A practical back-to-school hub for parents and educators: school readiness, calmer routines, emotional check-ins, an 8-page printable and multiplication help.",
  alternates: {
    canonical: url,
    languages: { en: url, hr: hrUrl },
  },
  openGraph: {
    title: "Curious, calm and ready to learn",
    description:
      "A gentler back-to-school guide with readiness support, calmer routines, learning help and a free 8-page printable.",
    url,
    type: "website",
  },
};

const items = [
  ["Is My Child Ready for School? Beyond Letters and Numbers", "school-readiness-beyond-letters-and-numbers"],
  ["Curious and Calm: A Gentle Back-to-School Plan for Children", "curious-and-calm-back-to-school"],
  ["How to Learn Multiplication Tables: 12 Easy Tricks for Kids", "how-to-learn-multiplication-tables"],
] as const;

export default function BackToSchoolPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Curious, calm and ready to learn",
    description: metadata.description,
    url,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map(([name, slug], index) => ({
        "@type": "ListItem",
        position: index + 1,
        name,
        url: `${siteConfig.url}/en/${slug}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <Header lang="en" switchUrl={`/hr/${BACK_TO_SCHOOL_SLUG.hr}`} />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10">
        <BackToSchoolLanding lang="en" />
      </main>
      <Footer lang="en" />
    </>
  );
}
