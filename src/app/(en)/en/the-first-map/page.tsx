import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MindsTheme from "@/components/minds/MindsTheme";
import FirstMapLanding from "@/components/FirstMapLanding";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

const url = `${siteConfig.url}/en/the-first-map`;

export const metadata: Metadata = {
  title: "The First Map - free developmental leaps keepsake | Mind Explorers",
  description:
    "A free, illustrated print keepsake walking you through all ten of your baby's developmental leaps, from week 5 to week 75. Download the PDF instantly, no email or sign-up required.",
  alternates: {
    canonical: url,
    languages: {
      en: url,
      hr: `${siteConfig.url}/hr/prva-karta`,
    },
  },
  openGraph: {
    title: "The First Map: a gentle guide to your baby's ten leaps",
    description:
      "A free, illustrated keepsake companion to the Developmental Leaps guide. Download the PDF, print it, keep it by the cot.",
    url,
    type: "website",
    images: [{ url: `${siteConfig.url}/images/the-first-map-cover.jpg`, width: 595, height: 842 }],
  },
};

export default function FirstMapPage() {
  return (
    <MindsTheme>
      <Header lang="en" switchUrl="/hr/prva-karta" />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <FirstMapLanding lang="en" />
      </main>
      <Footer lang="en" />
    </MindsTheme>
  );
}
