import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanks for subscribing | STEM Little Explorers",
  description:
    "Thanks for subscribing to the STEM Little Explorers newsletter — check your inbox to confirm.",
  // Conversion-confirmation page — reachable by URL for tracking, but kept out
  // of search results and the sitemap so it never shows up as a landing page.
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <>
      <Header lang="en" switchUrl="/hr/thank-you" />
      <main
        id="main-content"
        className="max-w-2xl mx-auto px-4 py-20 text-center"
      >
        <p className="text-5xl mb-6" aria-hidden="true">
          📬
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
          Thanks for subscribing!
        </h1>
        <p className="text-lg leading-relaxed text-gray-700 mb-8">
          You&rsquo;re almost there — please check your inbox and click the
          confirmation link to start getting new posts from STEM Little
          Explorers.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/en"
            className="bg-brand text-white px-5 py-2 rounded-lg hover:bg-brand-hover transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/en/activities"
            className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Explore activities
          </Link>
        </div>
      </main>
      <Footer lang="en" />
    </>
  );
}
