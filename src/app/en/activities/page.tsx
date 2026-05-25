import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActivitiesClient from "@/components/ActivitiesClient";
import { getPostsByTag } from "@/lib/posts";

export const metadata: Metadata = {
  title: "STEM Activities for Kids | STEM Little Explorers",
  description:
    "Browse hands-on STEM activities and experiments for kids — science, engineering, math, technology and more. Filter by subject to find the perfect project.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/en/activities",
    languages: {
      en: "https://stemlittleexplorers.com/en/activities",
      hr: "https://stemlittleexplorers.com/hr/activities",
    },
  },
};

export default function ActivitiesPage() {
  const posts = getPostsByTag("en", "activity");

  return (
    <>
      <Header lang="en" switchUrl="/hr/activities" />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            ⚡ Activities
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Hands-on experiments and projects you can try at home or in the
            classroom — no special equipment needed.
          </p>
        </div>

        <ActivitiesClient posts={posts} lang="en" />
      </main>
      <Footer lang="en" />
    </>
  );
}
