/**
 * Curated data for the "Baby development month by month" pillar page.
 *
 * Browser-safe (no imports), like tools.ts. The month posts can't be ordered
 * from the data itself (no age field; the `milestone` tag also mixes in a few
 * non-monthly activity posts), so the sequence is hand-curated here. Entries
 * link to posts by `translationKey`, so this one list drives BOTH the EN and
 * HR pillars; the page resolves each key to that language's real slug.
 *
 * The one-line `whatsNew` teasers are drafted from each post's own summary and
 * standard developmental norms — review/adjust for tone, especially the HR.
 */
type Lang = "en" | "hr";
type L = Record<Lang, string>;

/** Per-language URL slug under /{lang}. */
export const MILESTONE_GUIDE_SLUG: Record<Lang, string> = {
  en: "baby-development-month-by-month",
  hr: "razvoj-djeteta-po-mjesecima",
};

export const milestoneGuideCopy: Record<Lang, {
  title: string;        // <title> / SEO
  h1: string;
  intro: string;
  description: string;  // meta description
  readMore: string;     // per-row CTA label
}> = {
  en: {
    title: "Baby Development Month by Month: What to Expect (0–4 Years)",
    h1: "Baby development, month by month",
    intro:
      "A complete, month-by-month guide to your child's development from the newborn days to age four. Each stage links to a full article on what to expect, the new skills they're learning, and gentle ways to support them. Every child grows at their own pace, so treat this as a friendly map, not a checklist.",
    description:
      "What to expect from your baby month by month, from newborn to age 4: new skills, milestones and gentle tips for every stage. A complete developmental guide for parents.",
    readMore: "Read the full article",
  },
  hr: {
    title: "Razvoj djeteta po mjesecima: što očekivati (0–4 godine)",
    h1: "Razvoj djeteta, iz mjeseca u mjesec",
    intro:
      'Potpuni vodič kroz razvoj vašeg djeteta, iz mjeseca u mjesec, od novorođenačkih dana do četvrte godine. Svaka faza vodi na kompletan članak o tome što možete očekivati, koje nove vještine dijete uči i kako ga podržati u razvoju. Važno je napomenuti da svako dijete raste svojim tempom i postoji dosta širok raspon "normalnog za dob", pa neka vam ovo bude samo prijateljski putokaz.',
    description:
      "Što očekivati od bebe iz mjeseca u mjesec, od novorođenčeta do četvrte godine: nove vještine, razvojne prekretnice i savjeti za svaku fazu. Potpuni vodič za roditelje.",
    readMore: "Pročitaj cijeli članak",
  },
};

export interface MilestoneEntry {
  age: L;
  /** Shared key linking the EN and HR versions of the post. */
  translationKey: string;
  whatsNew: L;
}

export interface MilestoneStage {
  id: string;
  title: L;
  ageRange: L;
  blurb: L;
  entries: MilestoneEntry[];
}

export const milestoneStages: MilestoneStage[] = [
  {
    id: "newborn",
    title: { en: "The newborn stage", hr: "Novorođenče" },
    ageRange: { en: "0–3 months", hr: "0–3 mjeseca" },
    blurb: {
      en: "Sleeping, feeding, and the very first connections with you.",
      hr: "Spavanje, hranjenje i razvoj bliskosti.",
    },
    entries: [
      {
        age: { en: "Month 1", hr: "1. mjesec" },
        translationKey: "what-to-expect-from-newborn-in-first-month",
        whatsNew: {
          en: "Focusing on faces, newborn reflexes, and lots of sleep and feeding.",
          hr: "Fokusira pogled na lica, prvi refleksi, puno spavanja i jedenja.",
        },
      },
      {
        age: { en: "Month 2", hr: "2. mjesec" },
        translationKey: "what-to-expect-from-newborn-in-the-second-month",
        whatsNew: {
          en: "First social smiles and coos, with steadier head control.",
          hr: "Prvi društveni osmijesi i gukanje, uz sve bolju kontrolu glave.",
        },
      },
      {
        age: { en: "Month 3", hr: "3. mjesec" },
        translationKey: "what-to-expect-from-newborn-in-the-third-month",
        whatsNew: {
          en: "Following objects with the eyes, reaching for toys, more cooing.",
          hr: "Prati predmete pogledom, poseže za igračkama, više guče.",
        },
      },
    ],
  },
  {
    id: "discovering",
    title: { en: "Discovering the world", hr: "Otkrivanje svijeta" },
    ageRange: { en: "4–6 months", hr: "4–6 mjeseci" },
    blurb: {
      en: "Rolling, reaching, and the first tastes of solid food.",
      hr: "Prevrtanje, posezanje i prvi zalogaji krute hrane.",
    },
    entries: [
      {
        age: { en: "Month 4", hr: "4. mjesec" },
        translationKey: "baby-in-the-fourth-month",
        whatsNew: {
          en: "Rolling begins, grabbing for toys, and laughing out loud.",
          hr: "Počinje se prevrtati, hvata igračke i glasno se smije.",
        },
      },
      {
        age: { en: "Month 5", hr: "5. mjesec" },
        translationKey: "what-to-expect-from-the-baby-in-the-fifth-month",
        whatsNew: {
          en: "Reaching, grasping and mouthing everything; sitting with support.",
          hr: "Poseže, hvata i sve stavlja u usta; sjedi uz podršku.",
        },
      },
      {
        age: { en: "Month 6", hr: "6. mjesec" },
        translationKey: "baby-in-the-sixth-month",
        whatsNew: {
          en: "Sitting up, first tastes of solid food, and babbling.",
          hr: "Sjedenje, prvi zalogaji krute hrane i brbljanje.",
        },
      },
    ],
  },
  {
    id: "on-the-move",
    title: { en: "On the move", hr: "U pokretu" },
    ageRange: { en: "7–12 months", hr: "7–12 mjeseci" },
    blurb: {
      en: "Sitting, crawling, standing, and the very first words.",
      hr: "Sjedenje, puzanje, stajanje i prve riječi.",
    },
    entries: [
      {
        age: { en: "Month 7", hr: "7. mjesec" },
        translationKey: "baby-seventh-month",
        whatsNew: {
          en: "Sitting steadily, passing toys hand to hand; stranger awareness.",
          hr: "Stabilno sjedi, prebacuje igračke iz ruke u ruku; strah od stranaca.",
        },
      },
      {
        age: { en: "Month 8", hr: "8. mjesec" },
        translationKey: "baby-eighth-month",
        whatsNew: {
          en: "Crawling starts, the pincer grasp develops, responds to their name.",
          hr: "Počinje puzati, razvija pincetni hvat i reagira na svoje ime.",
        },
      },
      {
        age: { en: "Month 9", hr: "9. mjesec" },
        translationKey: "baby-ninth-month",
        whatsNew: {
          en: "Pulling up to stand, cruising furniture, and playing peekaboo.",
          hr: "Pridiže se na noge, kreće se uz namještaj, igra skrivača.",
        },
      },
      {
        age: { en: "Month 10", hr: "10. mjesec" },
        translationKey: "baby-tenth-month",
        whatsNew: {
          en: "Standing with support, waving bye-bye, and first gestures.",
          hr: "Stoji uz podršku, maše 'pa-pa' i prve geste.",
        },
      },
      {
        age: { en: "Month 11", hr: "11. mjesec" },
        translationKey: "baby-eleven-months-old",
        whatsNew: {
          en: "Cruising confidently and understanding simple words.",
          hr: "Sigurno se kreće uz namještaj i razumije jednostavne riječi.",
        },
      },
      {
        age: { en: "Month 12", hr: "12. mjesec" },
        translationKey: "baby-twelve-months-old",
        whatsNew: {
          en: "First steps and first words, and the first birthday!",
          hr: "Prvi koraci i prve riječi; prvi rođendan!",
        },
      },
    ],
  },
  {
    id: "second-year",
    title: { en: "The second year", hr: "Druga godina" },
    ageRange: { en: "13–24 months", hr: "13–24 mjeseca" },
    blurb: {
      en: "Walking, talking, and a growing sense of independence.",
      hr: "Hodanje, govor i sve veća samostalnost.",
    },
    entries: [
      {
        age: { en: "Months 13–14", hr: "13.–14. mjesec" },
        translationKey: "baby-thirteen-and-fourteen-month",
        whatsNew: {
          en: "Walking freely, more words, and a stronger will.",
          hr: "Samostalno hoda, sve više riječi i želje za odlučivanjem.",
        },
      },
      {
        age: { en: "Months 15–16", hr: "15.–16. mjesec" },
        translationKey: "baby-fifteenth-and-sixteenth-month",
        whatsNew: {
          en: "Climbing, scribbling, and following simple instructions.",
          hr: "Penje se, škraba i sluša jednostavne upute.",
        },
      },
      {
        age: { en: "Months 17–18", hr: "17.–18. mjesec" },
        translationKey: "baby-seventeen-and-eighteen-month",
        whatsNew: {
          en: "Running, a word explosion, and big feelings.",
          hr: "Trči, doživljava eksploziju riječi i velike emocije.",
        },
      },
      {
        age: { en: "Months 19–20", hr: "19.–20. mjesec" },
        translationKey: "baby-nineteenth-and-twentieth-month",
        whatsNew: {
          en: "Two-word phrases, pretend play, and a craving for independence.",
          hr: "Prve rečenice, igra pretvaranja i želja za samostalnošću.",
        },
      },
      {
        age: { en: "Months 21–22", hr: "21.–22. mjesec" },
        translationKey: "baby-21-and-22-months",
        whatsNew: {
          en: "Longer sentences, sorting shapes, and testing boundaries.",
          hr: "Duže rečenice, slaganje oblika i ispitivanje granica.",
        },
      },
      {
        age: { en: "2 years", hr: "2 godine" },
        translationKey: "two-year-old",
        whatsNew: {
          en: "Kicking a ball, short sentences, and the \"terrible twos\".",
          hr: "Šutira loptu, govori u kratkim rečenicama, potreba za autonomijom dovodi do izazovnih ponašanja.",
        },
      },
    ],
  },
  {
    id: "third-year",
    title: { en: "Into the third year", hr: "Treća godina" },
    ageRange: { en: "2–3 years", hr: "2–3 godine" },
    blurb: {
      en: "Big feelings, a big imagination, and lots of new words.",
      hr: "Velike emocije, bujna mašta i mnogo novih riječi.",
    },
    entries: [
      {
        age: { en: "2 years, 0–3 months", hr: "2 godine i 0–3 mjeseca" },
        translationKey: "toddler-first-three-months-after-second-year",
        whatsNew: {
          en: "Emotional outbursts, a big imagination, and growing social skills.",
          hr: "Emocionalni ispadi, bujna mašta i sve bolje društvene vještine.",
        },
      },
      {
        age: { en: "2½ years", hr: "2 i pol godine" },
        translationKey: "toddler-two-and-a-half-years-old",
        whatsNew: {
          en: "Jumping, naming colours, and a curious, turbulent stage.",
          hr: "Skače, imenuje boje; radoznala i turbulentna faza.",
        },
      },
      {
        age: { en: "2 years, 9 months", hr: "2 godine i 9 mjeseci" },
        translationKey: "toddler-with-two-years-and-nine-months",
        whatsNew: {
          en: "New sleep routines, imaginative play, and early planning.",
          hr: "Nove navike spavanja, maštovita igra i početak planiranja.",
        },
      },
    ],
  },
  {
    id: "preschool",
    title: { en: "The preschool years", hr: "Predškolske godine" },
    ageRange: { en: "3–4 years", hr: "3–4 godine" },
    blurb: {
      en: "A blossoming personality, endless questions, and a vivid imagination.",
      hr: "Osobnost koja cvjeta, beskrajna pitanja i bujna mašta.",
    },
    entries: [
      {
        age: { en: "3 years", hr: "3 godine" },
        translationKey: "child-three-years-old",
        whatsNew: {
          en: "The toddler-to-preschooler shift: personality, new interests, endless questions.",
          hr: "Prijelaz iz toddlera u dijete: osobnost, novi interesi i beskrajna pitanja.",
        },
      },
      {
        age: { en: "3½ years", hr: "3 i pol godine" },
        translationKey: "child-three-and-half-years-old",
        whatsNew: {
          en: "Growing independence, richer language, and lots of imaginative play.",
          hr: "Sve veća samostalnost, bogatiji govor i mnogo maštovite igre.",
        },
      },
      {
        age: { en: "4 years", hr: "4 godine" },
        translationKey: "four-years-old-child",
        whatsNew: {
          en: "Big emotions, sleep changes, art as expression, and vivid pretend play.",
          hr: "Velike emocije, promjene u spavanju, likovno izražavanje i maštovita igra pretvaranja.",
        },
      },
    ],
  },
];
