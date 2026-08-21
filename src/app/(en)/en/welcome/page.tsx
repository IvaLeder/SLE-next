import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterStatusPage from "@/components/NewsletterStatusPage";
import { Metadata } from "next";

// Completed signup page. Single opt-in lands here directly; legacy Mailchimp
// double-opt-in confirmation links use the same destination. Tracked in GTM as
// the completed-subscription conversion pageview.
export const metadata: Metadata = {
  title: "Welcome aboard | STEM Little Explorers",
  description: "You’re subscribed to the STEM Little Explorers newsletter.",
  robots: { index: false, follow: true },
};

export default function WelcomePage() {
  return (
    <>
      <Header lang="en" switchUrl="/hr/dobrodosli" />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-16">
        <NewsletterStatusPage lang="en" kind="welcome" />
      </main>
      <Footer lang="en" newsletter={false} />
    </>
  );
}
