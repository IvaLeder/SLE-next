import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SummerLanding from "@/components/SummerLanding";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Summer of curiosity — free summer STEM e-book | STEM Little Explorers",
  description:
    "A free, age-sorted e-book of 30+ screen-free summer science activities for kids — sensory play, backyard experiments and big-kid STEM. Download the PDF instantly, no email or sign-up required.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/en/summer",
    languages: {
      en: "https://stemlittleexplorers.com/en/summer",
      hr: "https://stemlittleexplorers.com/hr/ljeto",
    },
  },
};

export default function SummerPage() {
  return (
    <>
      <Header lang="en" switchUrl="/hr/ljeto" />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <SummerLanding lang="en" />
      </main>
      <Footer lang="en" />
    </>
  );
}
