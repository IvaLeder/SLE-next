/**
 * Affiliate-link configuration for the <Materials> MDX component.
 *
 * Amazon Associates is PER-REGION — each storefront (.com, .de, .sg, …) is a
 * separate program with its own tracking tag — so we keep one storefront + tag
 * per language:
 *   - en: the USA is the largest English-speaking audience → amazon.com.
 *         (Singapore shows up in analytics but is probably bot traffic.)
 *         For true multi-country geo-routing, set up Amazon OneLink and pass a
 *         full OneLink URL per item via `href` instead of a search `q`.
 *   - hr: Croatians order from Germany → amazon.de.
 *
 * `tag` is your Associates tracking id. Leave it "" and the links still work
 * (plain search links, just un-attributed) — fill it in to start earning.
 * Tags are public (they ride in every affiliate URL), so editing them here is
 * fine; nothing secret. Swap `host`/`label` freely as your audience shifts.
 */
export type Lang = "en" | "hr";

export interface Storefront {
  /** Amazon domain, no protocol (e.g. "www.amazon.com"). */
  host: string;
  /** Associates tracking id (e.g. "stemlittle-20"). "" = not yet configured. */
  tag: string;
  /** Short label shown for the store (e.g. "Amazon", "Amazon.de"). */
  label: string;
}

export const STOREFRONTS: Record<Lang, Storefront> = {
  en: { host: "www.amazon.com", tag: "explorers0b3-20", label: "Amazon" },
  hr: { host: "www.amazon.de", tag: "", label: "Amazon.de" },
};

/**
 * True once any storefront has a tag, i.e. the site is an Amazon Associate.
 * Gates every "As an Amazon Associate…" claim (Materials box, Advent shopping
 * list, privacy pages) so nothing claims membership before signup.
 */
export const IS_AMAZON_ASSOCIATE = Object.values(STOREFRONTS).some((s) => s.tag !== "");

/** Build an Amazon search-result affiliate link for a generic material. */
export function affiliateSearchUrl(lang: Lang, query: string): string {
  const { host, tag } = STOREFRONTS[lang];
  const u = new URL(`https://${host}/s`);
  u.searchParams.set("k", query);
  if (tag) u.searchParams.set("tag", tag);
  return u.toString();
}
