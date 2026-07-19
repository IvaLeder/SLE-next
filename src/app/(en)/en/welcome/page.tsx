import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterStatusPage from "@/components/NewsletterStatusPage";
import { Metadata } from "next";

// Post-signup step 2: Mailchimp's double-opt-in confirmation link lands here.
// Set as the audience's "Confirmation thank you page" URL in Mailchimp admin.
// Tracked in GTM as the "subscription confirmed" conversion pageview.
export const metadata: Metadata = {
  title: "Welcome aboard | STEM Little Explorers",
  description: "Your newsletter subscription is confirmed.",
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
