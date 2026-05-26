import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politika privatnosti | STEM Little Explorers",
  description: "Kako STEM Little Explorers prikuplja, koristi i štiti vaše osobne podatke.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr/privacy",
    languages: {
      en: "https://stemlittleexplorers.com/en/privacy",
      hr: "https://stemlittleexplorers.com/hr/privacy",
    },
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Header lang="hr" switchUrl="/en/privacy" />
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-10 prose prose-lg">
        <h1>Politika privatnosti</h1>
        <p className="text-gray-500 text-sm">Zadnja izmjena: {new Date().getFullYear()}.</p>

        <h2>Tko smo</h2>
        <p>
          STEM Little Explorers (<strong>stemlittleexplorers.com</strong>) je blog o
          STEM aktivnostima i razvoju djeteta, kojeg vodi Iva Leder.
        </p>

        <h2>Koje podatke prikupljamo</h2>
        <ul>
          <li>
            <strong>Pretplata na newsletter</strong> — adresa e-pošte, pohranjena kod
            pružatelja usluge Mailchimp. Više informacija na{" "}
            <a href="https://mailchimp.com/legal/privacy/" target="_blank" rel="noreferrer">
              Mailchimp politici privatnosti
            </a>
            .
          </li>
          <li>
            <strong>Kontaktni obrazac</strong> — ime, adresa e-pošte i sadržaj poruke,
            koriste se isključivo za odgovor na vaš upit.
          </li>
          <li>
            <strong>Analitika</strong> — koristimo analitiku radi razumijevanja koji
            su članci najkorisniji posjetiteljima. Osobni podaci se ne prodaju niti
            dijele s oglašivačima.
          </li>
        </ul>

        <h2>Kolačići (cookies)</h2>
        <p>
          Ova stranica koristi kolačiće trećih strana (Mailchimp, Google reCAPTCHA).
          Korištenjem stranice prihvaćate njihovu upotrebu. Kolačiće možete onemogućiti
          u postavkama preglednika.
        </p>

        <h2>Vaša prava (GDPR)</h2>
        <p>
          Ako se nalazite u EU/EEA, imate pravo pristupa, ispravka ili brisanja osobnih
          podataka koje čuvamo o vama. Za ostvarivanje ovih prava kontaktirajte nas putem{" "}
          <a href="/hr/contact">stranice za kontakt</a>.
        </p>

        <h2>Kontakt</h2>
        <p>
          Imate pitanja o ovoj politici? Koristite{" "}
          <a href="/hr/contact">kontaktni obrazac</a> i odgovorit ćemo što je brže
          moguće.
        </p>
      </main>
      <Footer lang="hr" />
    </>
  );
}
