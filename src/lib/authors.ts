export type AuthorInfo = {
  name: string;
  role: string;
  roleHr: string;
  bio: string;
  bioHr: string;
  avatar?: string;
};

/**
 * Author directory. Keys are the canonical identifiers used in post frontmatter
 * (`author: "Iva Leder"`). Treat the key as an id — to change a display name,
 * update the `name` field, not the key. That way 160+ post files don't need
 * to be touched.
 */
export const authors: Record<string, AuthorInfo> = {
  "Iva Leder": {
    avatar: "/images/iva-leder.jpg",
    name: "Iva Leder",
    role: "Psychologist",
    roleHr: "magistra psihologije",
    bio: "Founder of the idea for a website and a big lover of technology and everything that has some form of code in it. She has a few years of working with children under her belt and thinks it’s important to prepare them for the challenges that the future brings. With her vast database, I mean knowledge, she always strives to find new ways to teach more efficiently and creatively. She sees great potential in every child and her job is to find the right method to express that potential.",
    bioHr: "Idejni začetnik web stranice i veliki ljubitelj tehnologije i svega što sadrži bilo kakvu formu koda u sebi. Iva ima nekoliko godina iskustva u radu s djecom, a cilj joj je pripremiti ih za izazove koje donosi budućnost. Sa svojom ogromnom bazom podataka, ovaj, znanjem, njezina neprestana misija je pronalaženje novih načina kako bolje i efikasnije podučavati. Iva vidi ogroman potencijal u svakom djetetu, a njezin posao je pronaći najbolju metodu da se taj potencijal i ostvari."
  },
    "Vedran Leder": {
    avatar: "/images/vedran-leder.jpg",
    name: "Vedran Leder",
    role: "Psychologist",
    roleHr: "magistar psihologije",
    bio: "He always thought classical learning to be boring and bland. He likes to experiment and to learn by doing. With his childish nature, he always blended with children seamlessly. He finds that games and play are the best way to learn and always tries to include them in his working methods. He is fascinated with every new gadget (toy) and thinks that technology creates many opportunities for engaging and fun learning.",
    bioHr: "Oduvijek je mislio kako je klasično učenje dosadno i jednolično. Vedran voli eksperimentirati i zagovornik je iskustvenog učenja. Mlad u duši, uvijek se bez problema uklapao među djecu, bez obzira na dob. Smatra kako su igre i igranje najbolji način za stjecanje novih znanja i uvijek ih pokušava uključiti u svoje metode podučavanja. Fasciniran je svakom novom tehnološkom stvarčicom te smatra kako nam tehnologija može obogatiti iskustvo učenja i učiniti ga zabavnim."
},
}
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
