import { PostMeta } from "./posts";
import { siteConfig } from "@/config/site";
import { CATEGORY_DISPLAY, CategorySlug } from "./categories";

const SITE_URL = siteConfig.url;

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Generate an RSS 2.0 feed XML string.
 * If `category` is given, only posts in that canonical category are included
 * and the URL/title reflect the filter. Used by /rss-{lang}.xml (no filter)
 * and the 10 per-category feeds at /rss-{lang}-{category}.xml.
 */
export function generateRssFeed(
  posts: PostMeta[],
  lang: "en" | "hr",
  category?: CategorySlug
) {
  // Filter to the requested category if any. Comparison is against the
  // localised display name (which is what's stored in post.categories).
  let scoped = posts;
  if (category) {
    const displayName = CATEGORY_DISPLAY[lang][category].toLowerCase();
    scoped = posts.filter((p) =>
      p.categories?.some((c) => c.trim().toLowerCase() === displayName)
    );
  }

  const feedSlug = category ? `${lang}-${category}` : lang;
  const feedUrl  = `${SITE_URL}/rss-${feedSlug}.xml`;

  const subjectLabel = category ? ` — ${CATEGORY_DISPLAY[lang][category]}` : "";
  const title = `STEM Little Explorers — Blog${subjectLabel}`;
  const description =
    lang === "en"
      ? "Hands-on STEM activities, child development guides and psychology insights for parents and educators."
      : "Praktične STEM aktivnosti, vodiči za razvoj djeteta i savjeti iz psihologije za roditelje i odgajatelje.";

  // Most-recent post wins for lastBuildDate; falls back to "now" for empty feeds.
  const latestDate =
    scoped.length > 0
      ? new Date(Math.max(...scoped.map((p) => new Date(p.date).getTime())))
      : new Date();

  const itemsXml = scoped
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
