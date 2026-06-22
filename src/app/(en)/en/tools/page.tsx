import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolsHub from "@/components/tools/ToolsHub";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "STEM tools & toys | STEM Little Explorers",
  description:
    "Free interactive STEM tools for kids — turn your name into binary code, and more. No sign-up, just play.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/en/tools",
    languages: {
      en: "https://stemlittleexplorers.com/en/tools",
      hr: "https://stemlittleexplorers.com/hr/alati",
    },
  },
};

export default function ToolsPage() {
  return (
    <>
      <Header lang="en" switchUrl="/hr/alati" />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <ToolsHub lang="en" />
      </main>
      <Footer lang="en" />
    </>
  );
}
