/**
 * Affiliate-link configuration for the <Materials> MDX component.
 *
 * Amazon Associates is PER-REGION — each storefront (.com, .de, .sg, …) is a
 * separate program with its own tracking tag — so we keep one storefront + tag
 * per language:
 *   - en: a global English audience (currently Singapore-heavy) → amazon.sg.
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
  /** Amazon domain, no protocol (e.g. "www.amazon.sg"). */
  host: string;
  /** Associates tracking id (e.g. "stemlittle-20"). "" = not yet configured. */
  tag: string;
  /** Short label shown for the store (e.g. "Amazon", "Amazon.de"). */
  label: string;
}

export const STOREFRONTS: Record<Lang, Storefront> = {
  en: { host: "www.amazon.sg", tag: "", label: "Amazon" },
  hr: { host: "www.amazon.de", tag: "", label: "Amazon.de" },
};

/** Build an Amazon search-result affiliate link for a generic material. */
export function affiliateSearchUrl(lang: Lang, query: string): string {
  const { host, tag } = STOREFRONTS[lang];
  const u = new URL(`https://${host}/s`);
  u.searchParams.set("k", query);
  if (tag) u.searchParams.set("tag", tag);
  return u.toString();
}
