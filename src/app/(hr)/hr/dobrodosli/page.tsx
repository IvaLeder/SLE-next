import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterStatusPage from "@/components/NewsletterStatusPage";
import { Metadata } from "next";

// Dovršena pretplata. Single opt-in vodi ovdje izravno; ista stranica ostaje
// odredište za stare Mailchimp double-opt-in poveznice.
export const metadata: Metadata = {
  title: "Dobro došli | STEM Little Explorers",
  description: "Pretplaćeni ste na STEM Little Explorers newsletter.",
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
