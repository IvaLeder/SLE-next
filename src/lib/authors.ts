export type AuthorInfo = {
  name: string;
  role: string;
  roleHr: string;
  bio: string;
  bioHr: string;
};

/**
 * Author directory. Keys are the canonical identifiers used in post frontmatter
 * (`author: "Iva Leder"`). Treat the key as an id — to change a display name,
 * update the `name` field, not the key. That way 160+ post files don't need
 * to be touched.
 */
export const authors: Record<string, AuthorInfo> = {
  "Iva Leder": {
    name: "Iva Leder",
    role: "Educator & Child Development Writer",
    roleHr: "Pedagoginja i autorica",
    bio: "Iva is a mother and educator with a passion for child psychology and early development. She writes practical guides to help parents and educators support children's growth through play, science and creativity.",
    bioHr: "Iva je majka i pedagoginja s velikim interesom za dječju psihologiju i rani razvoj djeteta. Piše praktične vodiče koji roditeljima i odgajateljima pomažu podupirati djetetov razvoj kroz igru, znanost i kreativnost.",
  },
  "Vedran Leder": {
    name: "Vedran Leder",
    role: "Engineer & STEM Education Writer",
    roleHr: "Inženjer i STEM autor",
    bio: "Vedran is an engineer and father who loves turning everyday materials into hands-on STEM experiments. He designs the activities and engineering challenges that make science accessible and exciting for young explorers.",
    bioHr: "Vedran je inženjer i tata koji voli pretvarati svakodnevne materijale u praktične STEM pokuse. Osmišljava aktivnosti i inženjerske izazove koji djeci čine znanost pristupačnom i uzbudljivom.",
  },
};

/**
 * Look up an author by the value stored in post frontmatter.
 * Returns null when the key is missing OR the author isn't in the directory.
 * Case-insensitive and whitespace-tolerant — guards against minor typos
 * like `"iva leder"` or `" Iva Leder "` in frontmatter.
 */
export function getAuthor(idOrName?: string | null): AuthorInfo | null {
  if (!idOrName) return null;

  // Fast path: exact match
  if (authors[idOrName]) return authors[idOrName];

  // Fallback: case-insensitive scan (rare, only on frontmatter typos)
  const needle = idOrName.trim().toLowerCase();
  for (const [key, info] of Object.entries(authors)) {
    if (key.toLowerCase() === needle) return info;
  }
  return null;
}

/**
 * URL-safe slug for an author. "Iva Leder" → "iva-leder".
 * Used by /[lang]/author/[slug] route. Lowercase + spaces → hyphens.
 */
export function authorSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * Reverse lookup: slug → AuthorInfo. Used by the /author/[slug] page to
 * resolve the URL segment back to the directory entry.
 */
export function getAuthorBySlug(slug: string): AuthorInfo | null {
  const needle = slug.toLowerCase();
  for (const info of Object.values(authors)) {
    if (authorSlug(info.name) === needle) return info;
  }
  return null;
}

/**
 * All known author slugs, used by generateStaticParams.
 */
export function getAllAuthorSlugs(): string[] {
  return Object.values(authors).map((a) => authorSlug(a.name));
}
