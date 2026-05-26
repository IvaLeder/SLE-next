import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt | STEM Little Explorers",
  description:
    "Javite nam se — pitanja, prijedlozi tema ili samo pozdrav timu STEM Little Explorers.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr/contact",
    languages: {
      en: "https://stemlittleexplorers.com/en/contact",
      hr: "https://stemlittleexplorers.com/hr/contact",
    },
  },
};

export default function ContactPage() {
  return (
    <>
      <Header lang="hr" switchUrl="/en/contact" />
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-10">
        <ContactForm lang="hr" />
      </main>
      <Footer lang="hr" />
    </>
  );
}