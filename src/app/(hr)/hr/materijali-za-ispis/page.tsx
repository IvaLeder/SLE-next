import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrintablesHub from "@/components/PrintablesHub";
import { siteConfig } from "@/config/site";
import { PRINTABLES_SLUG } from "@/lib/printables";

const url = `${siteConfig.url}/hr/${PRINTABLES_SLUG.hr}`;
const enUrl = `${siteConfig.url}/en/${PRINTABLES_SLUG.en}`;

export const metadata: Metadata = {
  title: "Besplatni STEM radni listovi za ispis za djecu | STEM Little Explorers",
  description:
    "Besplatni STEM radni listovi, laboratorijski listovi, predlošci za izrezivanje i dnevnici promatranja za djecu. Preuzmite PDF i ispišite kod kuće ili u razredu.",
  alternates: {
    canonical: url,
    languages: { en: enUrl, hr: url, "x-default": enUrl },
  },
  openGraph: {
    title: "Besplatni STEM materijali za ispis za djecu",
    description:
      "Radni listovi, laboratorijski listovi, predlošci za izrezivanje i dnevnici promatranja uz naše praktične aktivnosti. Besplatni PDF-ovi, bez registracije.",
    url,
    type: "website",
  },
};

export default function MaterijaliZaIspisPage() {
  return (
    <>
      <Header lang="hr" switchUrl={`/en/${PRINTABLES_SLUG.en}`} />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <PrintablesHub lang="hr" />
      </main>
      <Footer lang="hr" newsletter={false} />
    </>
  );
}
