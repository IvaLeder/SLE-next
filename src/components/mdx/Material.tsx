import { affiliateSearchUrl, type Lang } from "@/lib/affiliate";

/**
 * A single material inside a <Materials> box. Links to the language's storefront
 * — either a search built from `q` (falling back to `name`), or an explicit
 * full `href` (a specific product, an Amazon OneLink, or a non-Amazon shop).
 * `rel="sponsored nofollow"` marks it as a paid link (Google's requirement).
 * Props are strings only, so they survive next-mdx-remote. `lang` is injected by
 * the MDX components factory.
 */
export default function Material({
  lang = "en",
  name,
  q,
  href,
}: {
  lang?: Lang;
  name: string;
  q?: string;
  href?: string;
}) {
  if (!name) return null;
  return (
    <li className="flex items-baseline gap-2 text-[15px] text-gray-700">
      <span aria-hidden="true" className="text-amber-500">•</span>
      <a
        href={href ?? affiliateSearchUrl(lang, q ?? name)}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        className="font-medium text-gray-800 underline decoration-amber-300 underline-offset-2 hover:text-amber-700"
      >
        {name}
      </a>
    </li>
  );
}
