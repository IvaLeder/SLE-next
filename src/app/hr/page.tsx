import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "STEM Little Explorers",
  description: "Zabavne STEM aktivnosti za djecu.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr",
    languages: {
      en: "https://stemlittleexplorers.com/en",
      hr: "https://stemlittleexplorers.com/hr",
    },
  },
};

export default function CroatianHomePage() {
  const posts = getAllPosts("hr");

  return (
    <>
      <Header lang="hr" />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <PostList posts={posts} lang="hr" />
      </main>
      <Footer lang="hr" />
    </>
  );
}