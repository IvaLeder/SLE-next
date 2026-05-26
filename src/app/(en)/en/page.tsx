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
  description:
    "Hands-on STEM activities, psychology insights, and educational resources for curious kids and parents.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/en",
    languages: {
      en: "https://stemlittleexplorers.com/en",
      hr: "https://stemlittleexplorers.com/hr",
      "x-default": "https://stemlittleexplorers.com/en",
    },
  },
};

export default function EnglishHomePage() {
  const posts = getAllPosts("en");

  return (
    <>
      <JsonLd data={generateWebsiteJsonLd("en")} />
      <Header lang="en" />
      {/* Issues 16 & 26: hero with value proposition replaces the empty top area */}
      <Hero lang="en" />
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-10">
        <PostList posts={posts} lang="en" />
      </main>
      <Footer lang="en" />
    </>
  );
}
