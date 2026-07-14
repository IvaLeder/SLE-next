/**
 * Copy + slugs for the Mind Explorers hub (the psychology sub-brand's
 * landing page at /en/minds and /hr/um).
 *
 * Browser-safe (only imports the also browser-safe categories.ts), like
 * tools.ts and milestone-guide.ts.
 * Brand rules live in mind-explorers-brand-sheet.md (repo root): the reader
 * is the explorer ("here's the map", never "we teach you"), sentence case,
 * calm and warm, no em dashes in any outward-facing string.
 *
 * HR strings are drafted for Iva's native review, same as the milestone
 * guide teasers.
 */
import { categorySlugFromName } from "./categories";

type Lang = "en" | "hr";

/** Per-language URL slug under /{lang}. Locked in BACKLOG §1c Phase 0. */
export const MINDS_SLUG: Record<Lang, string> = {
  en: "minds",
  hr: "um",
};

/**
 * Is a post a Mind Explorers surface? Single source of truth for the
 * "psychology content gets the minds theme" rule (article layouts, related
 * posts). Takes the frontmatter `categories` array (display names, either
 * language).
 */
export function isMindsPost(categories?: string[]): boolean {
  const first = categories?.[0];
  return !!first && categorySlugFromName(first) === "psychology";
}

/**
 * Tags whose landing pages are Mind Explorers surfaces (themed + compass
 * favicon). Only tags the hub links to as pillar-card destinations belong
 * here — the rule (2026-07-14) is that sub-brand NAVIGATION surfaces carry
 * the compass, while individual articles stay endorsed content with the
 * site favicon. `parenting` qualifies: it's the hub's Parenting pillar
 * target and every post carrying it is Psychology today.
 */
const MINDS_TAGS = new Set(["parenting"]);

export function isMindsTag(tag: string): boolean {
  return MINDS_TAGS.has(tag.toLowerCase());
}

export interface MindsPillar {
  id: string;
  title: string;
  blurb: string;
  /** Root-relative link target; null = pillar has no content yet. */
  href: string | null;
  linkLabel?: string;
}

export const mindsCopy: Record<
  Lang,
  {
    title: string; // <title> / SEO
    description: string; // meta description
    endorsement: string; // "part of…" line, links to the main site
    h1: string;
    tagline: string;
    intro: string;
    pillarsHeading: string;
    pillars: MindsPillar[];
    toolsHeading: string;
    toolsBlurb: string;
    tools: { title: string; blurb: string; href: string }[];
    latestHeading: string;
    allLink: string;
  }
> = {
  en: {
    title: "Mind Explorers: Maps for Growing Minds | STEM Little Explorers",
    description:
      "Evidence-based guides to how children grow, learn and feel: monthly development, developmental leaps and parenting psychology. Calm, warm and practical.",
    endorsement: "Part of STEM Little Explorers",
    h1: "Mind Explorers",
    tagline: "Maps for growing minds",
    intro:
      "STEM Little Explorers explores the outer world. Mind Explorers turns inward: how children grow, learn and feel, and how you can support them. You are the explorer here, and these are your maps. We offer them to help you navigate the journey, not to tell you what to do.",
    pillarsHeading: "Pick a map",
    pillars: [
      {
        id: "baby",
        title: "Baby & toddler",
        blurb:
          "What to expect month by month, from the newborn days to age four: new skills, developmental leaps and gentle ways to help.",
        href: "/en/baby-development-month-by-month",
        linkLabel: "Open the month-by-month guide",
      },
      {
        id: "parenting",
        title: "Parenting psychology",
        blurb:
          "Why tantrums happen, how speech develops and what the research actually says, evidence-based and battle-tested.",
        href: "/en/tag/parenting",
        linkLabel: "Browse parenting guides",
      },
      {
        id: "learning",
        title: "Learning & study",
        blurb:
          "Learning, study methods and focus. This part of the map is still being drawn; the first guides are on their way.",
        href: null,
      },
    ],
    toolsHeading: "Take a map with you",
    toolsBlurb:
      "Two small tools for the first 20 months: find out which developmental leap is happening around this time, and what each one means.",
    tools: [
      {
        title: "Developmental leap calculator",
        blurb: "Enter the due date and get the dates of all 10 leaps predicted.",
        href: "/en/tools/developmental-leap-calculator",
      },
      {
        title: "Developmental leaps explorer",
        blurb: "What changes in each leap and how to support it.",
        href: "/en/developmental-leaps",
      },
    ],
    latestHeading: "Latest guides",
    allLink: "Browse every psychology guide",
  },
  hr: {
    title: "Mind Explorers: karte za umove koji rastu | STEM Little Explorers",
    description:
      "Vodiči o tome kako djeca rastu, uče i osjećaju, utemeljeni na istraživanjima: razvoj po mjesecima, skokovi u razvoju i psihologija roditeljstva.",
    endorsement: "Dio STEM Little Explorers",
    h1: "Mind Explorers",
    tagline: "Karte za umove koji rastu",
    intro:
      "STEM Little Explorers istražuje vanjski svijet. Mind Explorers okreće se prema unutra: kako djeca rastu, uče i osjećaju, i kako ih u tome možete podržati. Ovdje ste vi istraživač, a ovo su vaše karte. Nudimo ih da vam olakšaju navigaciju, a ne da vam govore što morate raditi.",
    pillarsHeading: "Odaberite kartu",
    pillars: [
      {
        id: "baby",
        title: "Bebe i mališani",
        blurb:
          "Što očekivati iz mjeseca u mjesec, od novorođenačkih dana do četvrte godine: nove vještine, skokovi u razvoju i kako pomoći.",
        href: "/hr/razvoj-djeteta-po-mjesecima",
        linkLabel: "Otvori vodič po mjesecima",
      },
      {
        id: "parenting",
        title: "Psihologija roditeljstva",
        blurb:
          "Zašto se javljaju ispadi bijesa, kako se razvija govor i što istraživanja zaista kažu, znanstveno utemljeno i osobno proživljeno.",
        href: "/hr/tag/parenting",
        linkLabel: "Pregledaj vodiče o roditeljstvu",
      },
      {
        id: "learning",
        title: "Učenje i pamćenje",
        blurb:
          "Učenje, pamćenje i koncentracija. Ovaj dio karte tek se crta; prvi vodiči su na putu.",
        href: null,
      },
    ],
    toolsHeading: "Ponesite kartu sa sobom",
    toolsBlurb:
      "Dva mala alata za prvih 20 mjeseci: saznajte što su skokovi u razvoju i koji bi se trebao događati oko ovog perioda.",
    tools: [
      {
        title: "Kalkulator skokova u razvoju",
        blurb: "Upišite termin poroda i dobijte približne datume svih 10 skokova.",
        href: "/hr/alati/kalkulator-skokova-u-razvoju",
      },
      {
        title: "Vodič kroz skokove u razvoju",
        blurb: "Što se mijenja u svakom skoku i kako pružiti podršku.",
        href: "/hr/skokovi-u-razvoju",
      },
    ],
    latestHeading: "Najnoviji vodiči",
    allLink: "Pregledaj sve vodiče iz psihologije",
  },
};
