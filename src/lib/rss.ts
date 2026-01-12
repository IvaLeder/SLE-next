import { PostMeta } from "./posts";

export function generateRssFeed(posts: PostMeta[], lang: "en" | "hr") {
  const siteUrl = "https://stemlittleexplorers.com";
  const feedUrl = `${siteUrl}/rss-${lang}.xml`;
  const title = lang === "en" ? "STEM Little Explorers Blog" : "STEM Mali Istraživači Blog";
  const description =
    lang === "en"
      ? "Articles about STEM, learning, education, parenting, and early childhood exploration."
      : "Članci o STEM-u, učenju, edukaciji, roditeljstvu i ranom dječjem istraživanju.";

  const itemsXml = posts
    .map((post) => {
      const url = `${siteUrl}/${lang}/${post.slug}`;
      return `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${url}</link>
        <guid>${url}</guid>
        <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        <description><![CDATA[${post.excerpt ?? ""}]]></description>
      </item>
    `;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title><![CDATA[${title}]]></title>
      <link>${siteUrl}</link>
      <description><![CDATA[${description}]]></description>
      <language>${lang}</language>
      <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
      ${itemsXml}
    </channel>
  </rss>`;
}