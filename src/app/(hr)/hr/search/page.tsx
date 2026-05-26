import { Suspense } from "react";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchResults from "@/components/SearchResults";

export const metadata: Metadata = {
  title: "Pretraga | STEM Little Explorers",
  description: "Pretražite sve članke STEM Little Explorers.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr/search",
    languages: {
      en: "https://stemlittleexplorers.com/en/search",
      hr: "https://stemlittleexplorers.com/hr/search",
    },
  },
};

export default function SearchPage() {
  return (
    <>
      <Header lang="hr" switchUrl="/en/search" />
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-10">
        <Suspense fallback={<p className="text-gray-500">Učitavam…</p>}>
          <SearchResults lang="hr" />
        </Suspense>
      </main>
      <Footer lang="hr" />
    </>
  );
}
