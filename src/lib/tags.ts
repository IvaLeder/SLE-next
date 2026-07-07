/**
 * Tag registry. Lives separately from categories because:
 *  - Tags are CROSS-CUTTING (a single post can have many)
 *  - Tag URLs use ASCII keys (`/en/tag/activity`); labels are localised on render
 *
 * Adding a new tag = add the slug to KNOWN_TAGS + populate TAG_DISPLAY +
 * TAG_DESCRIPTION + update scripts/validate-posts.mjs KNOWN_TAGS.
 *
 * Browser-safe (no Node.js imports).
 */

export const KNOWN_TAGS = [
  "activity",
  "chemistry",
  "physics",
  "origami",
  "sensory",
  "parenting",
  "child-development",
  "experiment",
  "coding",
] as const;

export type TagSlug = (typeof KNOWN_TAGS)[number];

/** Localised display label for each tag. */
export const TAG_DISPLAY: Record<"en" | "hr", Record<TagSlug, string>> = {
  en: {
    activity:            "Activities",
    chemistry:           "Chemistry",
    physics:             "Physics",
    origami:             "Origami",
    sensory:             "Sensory play",
    parenting:           "Parenting",
    "child-development": "Child development",
    experiment:          "Experiments",
    coding:              "Coding",
  },
  hr: {
    activity:            "Aktivnosti",
    chemistry:           "Kemija",
    physics:             "Fizika",
    origami:             "Origami",
    sensory:             "Senzorne igre",
    parenting:           "Roditeljstvo",
    "child-development": "Razvoj djeteta",
    experiment:          "Eksperimenti",
    coding:              "Programiranje",
  },
};

/** One-sentence intro paragraph for each tag landing page. */
export const TAG_DESCRIPTION: Record<"en" | "hr", Record<TagSlug, string>> = {
  en: {
    activity:
      "Every hands-on project, in one place: chemistry experiments, engineering builds, origami, sensory play and more. Pick by subject above or browse the full list below.",
    chemistry:
      "Acid–base reactions, polymers, polarity, solubility: everything that fizzes, dissolves, dyes or transforms. All projects use kitchen ingredients; no lab equipment required.",
    physics:
      "Forces, motion, pressure, light, heat: the science of how the world moves. From homemade rockets to refraction demos, designed to make abstract concepts visible.",
    origami:
      "Paper folding for math, focus and patience. Each project implicitly teaches a geometry concept (symmetry, fractions, spatial reasoning).",
    sensory:
      "Tactile, visual and movement-based play for younger children designed to support sensorimotor development through textures, materials and exploration.",
    parenting:
      "Practical, evidence-informed parenting topics: speech development, cognitive growth, behavioral challenges, encouraging curiosity. Written for everyday family life.",
    "child-development":
      "Articles tracking what to expect at each stage: physical, cognitive, social, emotional. Grounded in pediatric and psychological research and common parenting questions.",
    experiment:
      "Activities with a hypothesis: predict, test, observe, conclude. Builds scientific method skills alongside the topic-specific learning.",
    coding:
      "Computer-science basics, mostly unplugged: algorithms, binary, encoding and logic. Learn how computers think — usually with no screen required.",
  },
  hr: {
    activity:
      "Sve praktične aktivnosti na jednom mjestu: kemijski pokusi, inženjerski pothvati, origami, senzorne igre i više. Birajte po temi ili pregledajte cijeli popis ispod.",
    chemistry:
      "Kiseline i baze, polimeri, polaritet, topljivost... Sve što se pjeni, otapa, mijenja oblik ili boju. Svi projekti koriste jednostavne kuhinjske sastojke; nije potrebna posebna oprema.",
    physics:
      "Sile, gibanje, tlak, svjetlost, toplina: znanost o tome kako se svijet kreće. Od domaćih raketa do demonstracija loma svjetlosti, smišljeno da pojasni apstraktne koncepte.",
    origami:
      "Savijanje papira idealno za razvijanje matematičkog razmišljanja, koncentracije i strpljenja. Svaki projekt implicitno podučava geometrijski koncept (simetrija, razlomci, prostorno razmišljanje).",
    sensory:
      "Taktilne, vizualne i pokretne igre za mlađu djecu: podržavaju senzomotorički razvoj kroz teksture, materijale i istraživanje.",
    parenting:
      "Praktične, na istraživanjima utemeljene roditeljske teme: razvoj govora, kognitivni razvoj, izazovi u ponašanju, poticanje znatiželje.",
    "child-development":
      "Članci o tome što očekivati u svakoj fazi razvoja. Pratimo i opisujemo fizički, kognitivni, socijalni i emocionalni razvoj. Utemeljeno na pedijatrijskim i psihološkim istraživanjima i čestim pitanjima roditelja.",
    experiment:
      "Testiranje hipoteza: predviđamo, testiramo, promatramo i zaključujemo. Ove aktivnosti pomažu u razvoju i primjeni znanstvenih metoda.",
    coding:
      "Osnove informatike, uglavnom bez ekrana: algoritmi, binarni kod, kodiranje i logika. Naučite kako računala razmišljaju.",
  },
};

/**
 * Tags surfaced in the UI as discovery chips (article footers, footer "Topics").
 *
 * A curated *topical* subset — what a post is ABOUT. The structural/audience
 * tags (`activity`, `parenting`, `child-development`) still have
 * fully working tag pages and power features like `/activities`, but we don't
 * push them as chips: they overlap with categories + the Activities page and
 * would add noise. To surface a tag, add its slug here. Order = display order.
 */
export const SURFACED_TAGS: readonly TagSlug[] = [
  "origami",
  "chemistry",
  "physics",
  "sensory",
  "experiment",
  "coding",
];

/** Type guard: is `slug` a known tag? */
export function isKnownTag(slug: string): slug is TagSlug {
  return (KNOWN_TAGS as readonly string[]).includes(slug);
}

/**
 * A post's tags, filtered to the surfaced topical set and returned in
 * `SURFACED_TAGS` display order (so chips render consistently regardless of the
 * order tags appear in frontmatter). Posts whose only tags are structural
 * return `[]` and render no chip row.
 */
export function surfacedTagsOf(tags: readonly string[] | undefined): TagSlug[] {
  if (!tags || tags.length === 0) return [];
  const present = new Set(tags.map((t) => t.trim().toLowerCase()));
  return SURFACED_TAGS.filter((t) => present.has(t));
}
