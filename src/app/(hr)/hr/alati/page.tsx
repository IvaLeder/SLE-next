import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolsHub from "@/components/tools/ToolsHub";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "STEM alati i igračke | STEM Little Explorers",
  description:
    "Besplatni interaktivni STEM alati za djecu: pretvorite ime u binarni kod i još mnogo toga. Bez registracije, samo se igrajte.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr/alati",
    languages: {
      en: "https://stemlittleexplorers.com/en/tools",
      hr: "https://stemlittleexplorers.com/hr/alati",
    },
  },
};

export default function AlatiPage() {
  return (
    <>
      <Header lang="hr" switchUrl="/en/tools" />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <ToolsHub lang="hr" />
      </main>
      <Footer lang="hr" />
    </>
  );
}
