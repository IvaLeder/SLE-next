import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { generateWebsiteJsonLd, generateOrganizationJsonLd } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "STEM Little Explorers",
  description: "Zabavne STEM aktivnosti i psihološki savjeti za djecu i roditelje.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr",
    languages: {
      en: "https://stemlittleexplorers.com/en",
      hr: "https://stemlittleexplorers.com/hr",
      "x-default": "https://stemlittleexplorers.com/en",
    },
  },
};

export default function CroatianHomePage() {
  const posts = getAllPosts("hr");

  return (
    <>
      <JsonLd data={generateWebsiteJsonLd("hr")} />
      <JsonLd data={generateOrganizationJsonLd()} />
      <Header lang="hr" />
      <Hero lang="hr" />
      <main id="main-content" className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-2">
          <h2 className="font-sans text-2xl md:text-3xl font-bold tracking-tight">
            Najnovije objave
          </h2>
          <p className="mt-1 text-gray-600">
            Praktični pokusi i savjeti za roditelje i edukatore
          </p>
        </div>
        <PostList posts={posts} lang="hr" />
      </main>
      <Footer lang="hr" />
    </>
  );
}
