import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterStatusPage from "@/components/NewsletterStatusPage";
import { Metadata } from "next";

// Post-signup step 1: the on-site form redirects here after a successful
// submit. Tracked in GTM as the "newsletter signup" conversion pageview.
export const metadata: Metadata = {
  title: "Provjerite inbox | STEM Little Explorers",
  description: "Još jedan korak: potvrdite pretplatu na newsletter putem emaila.",
  robots: { index: false, follow: true },
};

export default function HvalaPage() {
  return (
    <>
      <Header lang="hr" switchUrl="/en/thank-you" />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-16">
        <NewsletterStatusPage lang="hr" kind="thankYou" />
      </main>
      <Footer lang="hr" newsletter={false} />
    </>
  );
}
