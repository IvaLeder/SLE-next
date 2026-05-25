import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";
import { generateRssFeed } from "@/lib/rss";

export async function GET() {
  const posts = getAllPosts("en");
  const rss = generateRssFeed(posts, "en");

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}