import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { generateWebsiteJsonLd } from "@/lib/metadata";

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
      <Header lang="hr" />
      <Hero lang="hr" />
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-10">
        <PostList posts={posts} lang="hr" />
      </main>
      <Footer lang="hr" />
    </>
  );
}
