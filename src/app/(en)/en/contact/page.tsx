import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | STEM Little Explorers",
  description: "Get in touch with the STEM Little Explorers team.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/en/contact",
    languages: {
      en: "https://stemlittleexplorers.com/en/contact",
      hr: "https://stemlittleexplorers.com/hr/contact",
    },
  },
};

export default function ContactPage() {
  return (
    <>
      <Header lang="en" switchUrl="/hr/contact" />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <ContactForm lang="en" />
      </main>
      <Footer lang="en" />
    </>
  );
}