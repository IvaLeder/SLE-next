import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";
import { generateRssFeed } from "@/lib/rss";

// Static export: rendered once at build time into out/<feed>.xml.
export const dynamic = "force-static";

export async function GET() {
  const posts = getAllPosts("en");
  const rss = generateRssFeed(posts, "en", "psychology");
  return new NextResponse(rss, { headers: { "Content-Type": "application/xml" } });
}
