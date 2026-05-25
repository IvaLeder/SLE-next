import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "STEM Little Explorers",
  description: "Fun STEM activities and psychology tips for kids.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/en",
    languages: {
      en: "https://stemlittleexplorers.com/en",
      hr: "https://stemlittleexplorers.com/hr",
    },
  },
};

export default function EnglishHomePage() {
  const posts = getAllPosts("en");

  return (
    <>
      <Header lang="en" />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <PostList posts={posts} lang="en" />
      </main>
      <Footer lang="en" />
    </>
  );
}