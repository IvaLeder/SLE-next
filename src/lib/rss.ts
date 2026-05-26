import { PostMeta } from "./posts";
import { siteConfig } from "@/config/site";

const SITE_URL = siteConfig.url;

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function generateRssFeed(posts: PostMeta[], lang: "en" | "hr") {
  const feedUrl = `${SITE_URL}/rss-${lang}.xml`;
  const title = "STEM Little Explorers — Blog";
  const description =
    lang === "en"
      ? "Hands-on STEM activities, child development guides and psychology insights for parents and educators."
      : "Praktične STEM aktivnosti, vodiči za razvoj djeteta i savjeti iz psihologije za roditelje i odgajatelje.";

  // Most-recent post wins for lastBuildDate; falls back to "now" for empty feeds.
  const latestDate =
    posts.length > 0
      ? new Date(Math.max(...posts.map((p) => new Date(p.date).getTime())))
      : new Date();

  const itemsXml = posts
    .slice(0, 50) // cap so feed readers don't fetch hundreds of items at once
    .map((post) => {
      const url      = `${SITE_URL}/${lang}/${post.slug}`;
      const pubDate  = new Date(post.date).toUTCString();
      const author   = post.author ?? siteConfig.author.name;
      const excerpt  = post.description || post.excerpt || "";
      const category = post.categories?.[0] ?? "";

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${xmlEscape(url)}</link>
      <guid isPermaLink="true">${xmlEscape(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${author}]]></dc:creator>
      ${category ? `<category><![CDATA[${category}]]></category>` : ""}
      <description><![CDATA[${excerpt}]]></description>
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title><![CDATA[${title}]]></title>
    <link>${SITE_URL}/${lang}</link>
    <description><![CDATA[${description}]]></description>
    <language>${lang}</language>
    <lastBuildDate>${latestDate.toUTCString()}</lastBuildDate>
    <atom:link href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;
}
