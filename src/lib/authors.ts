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
    bio: "The founder behind the site and a devoted lover of technology — and anything with a bit of code in it. With several years of experience working with children, she is driven by the belief that we should prepare them for the challenges ahead. She is always searching for new, more creative and effective ways to teach, and sees real potential in every child — her job is simply to find the right way to unlock it.",
    bioHr: "Idejna začetnica stranice i velika ljubiteljica tehnologije — i svega što u sebi sadrži barem malo koda. S nekoliko godina iskustva u radu s djecom, vodi je uvjerenje da ih treba pripremiti za izazove koji dolaze. Neprestano traži nove, kreativnije i učinkovitije načine podučavanja te vidi velik potencijal u svakom djetetu — njezin je posao pronaći pravi način da ga oslobodi."
  },
    "Vedran Leder": {
    avatar: "/images/vedran-leder.jpg",
    name: "Vedran Leder",
    role: "Psychologist",
    roleHr: "magistar psihologije",
    bio: "He always found classical learning a little dull — he would rather experiment and learn by doing. Young at heart, he blends in with children effortlessly, and believes games and play are the best way to learn, weaving them into everything he teaches. Every new gadget (read: toy) fascinates him, and he is convinced technology opens up endless opportunities for fun, hands-on learning.",
    bioHr: "Oduvijek je klasično učenje smatrao pomalo dosadnim — radije eksperimentira i zagovornik je iskustvenog učenja. Mlad u duši, bez problema se uklapa među djecu bez obzira na dob, i vjeruje da su igra i igranje najbolji način za stjecanje znanja pa ih uključuje u svaku svoju metodu podučavanja. Fascinira ga svaka nova tehnološka stvarčica (čitaj: igračka) i uvjeren je da tehnologija može obogatiti učenje i učiniti ga zabavnim."
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
