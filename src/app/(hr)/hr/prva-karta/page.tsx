import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MindsTheme from "@/components/minds/MindsTheme";
import FirstMapLanding from "@/components/FirstMapLanding";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

const url = `${siteConfig.url}/hr/prva-karta`;

export const metadata: Metadata = {
  title: "Prva karta - besplatna knjižica o skokovima u razvoju | Mind Explorers",
  description:
    "Besplatna ilustrirana knjižica za ispis koja vas vodi kroz svih deset bebinih skokova u razvoju, od 5. do 75. tjedna. Preuzmite PDF odmah, bez emaila i registracije.",
  alternates: {
    canonical: url,
    languages: {
      en: `${siteConfig.url}/en/the-first-map`,
      hr: url,
    },
  },
  openGraph: {
    title: "Prva karta: nježan vodič kroz deset bebinih skokova",
    description:
      "Besplatna ilustrirana knjižica uz vodič Skokovi u razvoju. Preuzmite PDF, ispišite i držite uz krevetić.",
    url,
    type: "website",
    images: [{ url: `${siteConfig.url}/images/prva-karta-cover.jpg`, width: 595, height: 842 }],
  },
};

export default function PrvaKartaPage() {
  return (
    <MindsTheme>
      <Header lang="hr" switchUrl="/en/the-first-map" />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <FirstMapLanding lang="hr" />
      </main>
      <Footer lang="hr" />
    </MindsTheme>
  );
}
