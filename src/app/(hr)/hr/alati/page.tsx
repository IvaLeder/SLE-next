import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolsHub from "@/components/tools/ToolsHub";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Besplatni STEM alati i igre za djecu | STEM Little Explorers",
  description:
    "Besplatni interaktivni STEM alati i igre za djecu. Istražujte matematiku, tajne kodove, boje, logiku i rano učenje bez registracije.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr/alati",
    languages: {
      en: "https://stemlittleexplorers.com/en/tools",
      hr: "https://stemlittleexplorers.com/hr/alati",
      "x-default": "https://stemlittleexplorers.com/en/tools",
    },
  },
};

export default function AlatiPage() {
  return (
    <>
      <Header lang="hr" switchUrl="/en/tools" />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <ToolsHub lang="hr" />
      </main>
      <Footer lang="hr" />
    </>
  );
}
