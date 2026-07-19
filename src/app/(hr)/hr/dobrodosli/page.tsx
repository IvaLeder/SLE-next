import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterStatusPage from "@/components/NewsletterStatusPage";
import { Metadata } from "next";

// Post-signup step 2: Mailchimp's double-opt-in confirmation link lands here.
// Mailchimp allows a single "Confirmation thank you page" per audience (set to
// the EN /welcome page); this HR twin exists for the header language switch
// and any future per-language routing.
export const metadata: Metadata = {
  title: "Dobro došli | STEM Little Explorers",
  description: "Vaša pretplata na newsletter je potvrđena.",
  robots: { index: false, follow: true },
};

export default function DobrodosliPage() {
  return (
    <>
      <Header lang="hr" switchUrl="/en/welcome" />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-16">
        <NewsletterStatusPage lang="hr" kind="welcome" />
      </main>
      <Footer lang="hr" newsletter={false} />
    </>
  );
}
