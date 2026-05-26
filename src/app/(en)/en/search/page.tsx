import { Suspense } from "react";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchResults from "@/components/SearchResults";

export const metadata: Metadata = {
  title: "Search | STEM Little Explorers",
  description: "Search all STEM Little Explorers articles.",
  // Don't index search result pages — they're not content.
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://stemlittleexplorers.com/en/search",
    languages: {
      en: "https://stemlittleexplorers.com/en/search",
      hr: "https://stemlittleexplorers.com/hr/search",
    },
  },
};

export default function SearchPage() {
  return (
    <>
      <Header lang="en" switchUrl="/hr/search" />
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-10">
        {/* useSearchParams requires a Suspense boundary in App Router. */}
        <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
          <SearchResults lang="en" />
        </Suspense>
      </main>
      <Footer lang="en" />
    </>
  );
}
