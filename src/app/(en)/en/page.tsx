import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import SummerBanner from "@/components/SummerBanner";
import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import AdSenseScript from "@/components/AdSenseScript";
import { AD_SLOTS } from "@/lib/ads";
import { generateWebsiteJsonLd, generateOrganizationJsonLd } from "@/lib/metadata";

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
      <JsonLd data={generateOrganizationJsonLd()} />
      {/* In-feed ad card in the post grid needs the AdSense library. */}
      <AdSenseScript />
      <Header lang="en" />
      {/* Issues 16 & 26: hero with value proposition replaces the empty top area */}
      <Hero lang="en" />
      <div className="px-4">
        <SummerBanner lang="en" />
      </div>
      <main id="main-content" className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-2">
          <h2 className="font-sans text-2xl md:text-3xl font-bold tracking-tight">
            Latest articles
          </h2>
          <p className="mt-1 text-gray-600">
            Hands-on experiments and parenting insights
          </p>
        </div>
        <PostList posts={posts} lang="en" adSlot={AD_SLOTS.inFeed} />
      </main>
      <Footer lang="en" />
    </>
  );
}
