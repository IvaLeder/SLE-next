import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";
import { generateRssFeed } from "@/lib/rss";

export async function GET() {
  const posts = getAllPosts("hr");
  const rss = generateRssFeed(posts, "hr");

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}