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
  "milestone",
  "experiment",
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
    milestone:           "Milestones",
    experiment:          "Experiments",
  },
  hr: {
    activity:            "Aktivnosti",
    chemistry:           "Kemija",
    physics:             "Fizika",
    origami:             "Origami",
    sensory:             "Senzorne igre",
    parenting:           "Roditeljstvo",
    "child-development": "Razvoj djeteta",
    milestone:           "Razvojne prekretnice",
    experiment:          "Eksperimenti",
  },
};

/** One-sentence intro paragraph for each tag landing page. */
export const TAG_DESCRIPTION: Record<"en" | "hr", Record<TagSlug, string>> = {
  en: {
    activity:
      "Every hands-on project, in one place — chemistry experiments, engineering builds, origami, sensory play and more. Pick by subject above or browse the full list below.",
    chemistry:
      "Acid–base reactions, polymers, polarity, solubility — everything that fizzes, dissolves, dyes or transforms. All projects use kitchen ingredients; no lab equipment required.",
    physics:
      "Forces, motion, pressure, light, heat — the science of how the world moves. From homemade rockets to refraction demos, designed to make abstract concepts visible.",
    origami:
      "Paper folding for math, focus and patience. Each project teaches a geometry concept (symmetry, fractions, spatial reasoning) alongside the fold sequence.",
    sensory:
      "Tactile, visual and movement-based play for younger children — supporting sensorimotor development through textures, materials and exploration.",
    parenting:
      "Practical, evidence-informed parenting topics — temper tantrums, speech development, cognitive growth, encouraging curiosity. Written for everyday family life.",
    "child-development":
      "Articles tracking what to expect at each stage — physical, cognitive, social, emotional. Grounded in pediatric research and common parenting questions.",
    milestone:
      "Month-by-month developmental milestone guides for the first three years. What to look for, what's typical, when to ask the doctor.",
    experiment:
      "Activities with a hypothesis — predict, test, observe, conclude. Builds scientific method skills alongside the topic-specific learning.",
  },
  hr: {
    activity:
      "Sve praktične aktivnosti na jednom mjestu — kemijski pokusi, inženjerske gradnje, origami, senzorne igre i više. Odaberite predmet iznad ili pregledajte cijelu listu ispod.",
    chemistry:
      "Acidi i baze, polimeri, polaritet, topljivost — sve što pjeni, otapa, boji ili mijenja oblik. Svi projekti koriste kuhinjske sastojke; nije potrebna laboratorijska oprema.",
    physics:
      "Sile, gibanje, tlak, svjetlost, toplina — znanost o tome kako se svijet kreće. Od domaćih raketa do demonstracija loma svjetlosti, dizajnirano da apstraktne koncepte čini vidljivima.",
    origami:
      "Savijanje papira za matematiku, koncentraciju i strpljenje. Svaki projekt podučava geometrijski koncept (simetrija, razlomci, prostorno razmišljanje) uz slijed savijanja.",
    sensory:
      "Taktilne, vizualne i pokretne igre za mlađu djecu — podržavaju senzomotorički razvoj kroz teksture, materijale i istraživanje.",
    parenting:
      "Praktične, na istraživanjima utemeljene roditeljske teme — ispadi bijesa, razvoj govora, kognitivni rast, poticanje znatiželje. Pisano za svakodnevni obiteljski život.",
    "child-development":
      "Članci o tome što očekivati u svakoj fazi — fizički, kognitivni, društveni, emocionalni razvoj. Utemeljeno na pedijatrijskim istraživanjima i čestim pitanjima roditelja.",
    milestone:
      "Mjesečni vodiči za razvojne prekretnice prve tri godine. Što tražiti, što je tipično, kada se obratiti liječniku.",
    experiment:
      "Aktivnosti s hipotezom — predvidi, testiraj, promatraj, zaključi. Razvija vještine znanstvene metode uz učenje teme.",
  },
};

/** Type guard: is `slug` a known tag? */
export function isKnownTag(slug: string): slug is TagSlug {
  return (KNOWN_TAGS as readonly string[]).includes(slug);
}
