import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolsHub from "@/components/tools/ToolsHub";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free STEM Tools & Games for Kids | STEM Little Explorers",
  description:
    "Free interactive STEM tools and games for kids. Explore math, secret codes, colours, logic and early learning in your browser. No sign-up needed.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/en/tools",
    languages: {
      en: "https://stemlittleexplorers.com/en/tools",
      hr: "https://stemlittleexplorers.com/hr/alati",
      "x-default": "https://stemlittleexplorers.com/en/tools",
    },
  },
};

export default function ToolsPage() {
  return (
    <>
      <Header lang="en" switchUrl="/hr/alati" />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <ToolsHub lang="en" />
      </main>
      <Footer lang="en" />
    </>
  );
}
