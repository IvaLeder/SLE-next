import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hvala na pretplati | STEM Little Explorers",
  description:
    "Hvala na pretplati na newsletter STEM Little Explorers — provjerite inbox za potvrdu.",
  // Conversion-confirmation page — reachable by URL for tracking, but kept out
  // of search results and the sitemap so it never shows up as a landing page.
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <>
      <Header lang="hr" switchUrl="/en/thank-you" />
      <main
        id="main-content"
        className="max-w-2xl mx-auto px-4 py-20 text-center"
      >
        <p className="text-5xl mb-6" aria-hidden="true">
          📬
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
          Hvala na pretplati!
        </h1>
        <p className="text-lg leading-relaxed text-gray-700 mb-8">
          Još samo jedan korak — provjerite inbox i kliknite poveznicu za potvrdu
          kako biste počeli primati nove objave STEM Little Explorersa.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/hr"
            className="bg-brand text-white px-5 py-2 rounded-lg hover:bg-brand-hover transition-colors"
          >
            Natrag na početnu
          </Link>
          <Link
            href="/hr/activities"
            className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Istraži aktivnosti
          </Link>
        </div>
      </main>
      <Footer lang="hr" />
    </>
  );
}
