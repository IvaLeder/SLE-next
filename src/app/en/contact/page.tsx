import ContactForm from "@/components/ContactForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About STEM Little Explorers",
  description: "Learn more about our blog and mission",
  alternates: {
    canonical: "https://stemlittleexplorers.com/en/contact",
    languages: {
      en: "https://stemlittleexplorers.com/en/contact",
      hr: "https://stemlittleexplorers.com/hr/contact",
    },
  },
};

export default function ContactPage() {
  return <ContactForm lang="en" />;
}