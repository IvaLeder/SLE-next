import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uvjeti korištenja | STEM Little Explorers",
  description: "Uvjeti i odredbe korištenja web stranice STEM Little Explorers.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr/terms",
    languages: {
      en: "https://stemlittleexplorers.com/en/terms",
      hr: "https://stemlittleexplorers.com/hr/terms",
    },
  },
};

export default function TermsPage() {
  return (
    <>
      <Header lang="hr" switchUrl="/en/terms" />
      <main className="max-w-3xl mx-auto px-4 py-10 prose prose-lg">
        <h1>Uvjeti korištenja</h1>
        <p className="text-gray-500 text-sm">Zadnja izmjena: {new Date().getFullYear()}.</p>

        <h2>Prihvaćanje uvjeta</h2>
        <p>
          Korištenjem stranice <strong>stemlittleexplorers.com</strong> prihvaćate ove
          Uvjete korištenja. Ako ih ne prihvaćate, molimo vas da ne koristite stranicu.
        </p>

        <h2>Sadržaj</h2>
        <p>
          Svi članci, aktivnosti i resursi na ovoj stranici namijenjeni su isključivo
          informativnim i obrazovnim svrhama. Nisu zamjena za stručni medicinski,
          psihološki ni pedagoški savjet. Za brige vezane uz zdravlje ili razvoj vašeg
          djeteta uvijek se posavjetujte s kvalificiranim stručnjakom.
        </p>

        <h2>Intelektualno vlasništvo</h2>
        <p>
          Sav izvorni sadržaj na ovoj stranici — tekstovi, slike i videi — vlasništvo
          su STEM Little Explorers, osim ako nije drugačije naznačeno. Sadržaj možete
          dijeliti uz odgovarajuće navođenje izvora i povratne veze na izvorni članak.
          Objavljivanje cijelog teksta bez dozvole nije dopušteno.
        </p>

        <h2>Vanjske veze</h2>
        <p>
          Stranica može sadržavati poveznice na web-mjesta trećih strana. Nismo odgovorni
          za sadržaj ni praksu zaštite privatnosti tih stranica.
        </p>

        <h2>Ograničenje odgovornosti</h2>
        <p>
          STEM Little Explorers nije odgovoran za štetu nastalu korištenjem informacija
          ili aktivnosti opisanih na ovoj stranici. Sve aktivnosti s djecom trebaju
          se provoditi pod nadzorom odrasle osobe.
        </p>

        <h2>Izmjene uvjeta</h2>
        <p>
          Zadržavamo pravo izmjene ovih uvjeta u bilo koje vrijeme. Nastavak korištenja
          stranice nakon objave izmjena smatra se prihvaćanjem novih uvjeta.
        </p>

        <h2>Kontakt</h2>
        <p>
          Imate pitanja? Kontaktirajte nas putem{" "}
          <a href="/hr/contact">stranice za kontakt</a>.
        </p>
      </main>
      <Footer lang="hr" />
    </>
  );
}
