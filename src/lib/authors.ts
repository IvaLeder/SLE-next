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
    bio: "The founder of STEM Little Explorers and a lifelong lover of learning, she believes that education has the power to change lives. Always searching for more creative and effective ways to teach, she sees unlimited potential in every child. Her mission is simple: to help unlock that potential by finding the approach that works best for each unique learner.",
    bioHr: "Osnivačica STEM Little Explorers-a i zaljubljenica u cjeloživotno učenje, vjeruje da obrazovanje ima moć mijenjati živote. Neprestano istražuje kreativnije i učinkovitije načine poučavanja te u svakom djetetu vidi neograničen potencijal. Njezina je misija jednostavna: pomoći svakom djetetu da ostvari svoj puni potencijal pronalazeći pristup koji najbolje odgovara upravo njemu."
  },
  "Vedran Leder": {
    avatar: "/images/vedran-leder.jpg",
    name: "Vedran Leder",
    role: "Psychologist",
    roleHr: "magistar psihologije",
    bio: "He always found traditional learning a little dull; he'd much rather experiment, explore, and learn by doing. Young at heart, he connects effortlessly with children and believes that play is one of the most powerful ways to learn, weaving games into everything he teaches. Every new gadget (or toy!) captures his imagination, and he's convinced that technology opens up endless opportunities for fun, hands-on learning.",
    bioHr: "Oduvijek je klasično učenje smatrao pomalo dosadnim - radije eksperimentira i zagovornik je iskustvenog učenja. Mlad u duši, bez problema se uklapa među djecu bez obzira na dob, i vjeruje da su igra i igranje najbolji način za stjecanje znanja pa ih uključuje u svaku svoju metodu podučavanja. Fascinira ga svaka nova tehnološka stvarčica (ili igračka!) i uvjeren je da tehnologija može obogatiti učenje i učiniti ga zabavnijim."
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
