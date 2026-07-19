import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterStatusPage from "@/components/NewsletterStatusPage";
import { Metadata } from "next";

// Post-signup step 1: the on-site form redirects here after a successful
// submit. Tracked in GTM as the "newsletter signup" conversion pageview.
export const metadata: Metadata = {
  title: "Check your inbox | STEM Little Explorers",
  description: "One more step: confirm your newsletter subscription by email.",
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <>
      <Header lang="en" switchUrl="/hr/hvala" />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-16">
        <NewsletterStatusPage lang="en" kind="thankYou" />
      </main>
      <Footer lang="en" newsletter={false} />
    </>
  );
}
