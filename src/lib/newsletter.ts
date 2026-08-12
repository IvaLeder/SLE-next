/**
 * Content model for the on-site newsletter subscribe flow. Single source of
 * truth for the three page pairs:
 *   - landing:   /en/subscribe  + /hr/pretplata   (form, indexable)
 *   - thank-you: /en/thank-you  + /hr/hvala       (after form submit, noindex)
 *   - welcome:   /en/welcome    + /hr/dobrodosli  (after double opt-in
 *     confirmation — set as the audience's "Confirmation thank you page" in
 *     Mailchimp, noindex)
 *
 * The thank-you and welcome URLs exist for GTM/GA4 conversion tracking: a
 * pageview on each marks "signup submitted" and "subscription confirmed".
 * Browser-safe (no Node imports).
 */

export type Lang = "en" | "hr";
type L = Record<Lang, string>;

export const SUBSCRIBE_SLUG: L = { en: "subscribe", hr: "pretplata" };
export const THANK_YOU_SLUG: L = { en: "thank-you", hr: "hvala" };
export const WELCOME_SLUG: L = { en: "welcome", hr: "dobrodosli" };

export const subscribeCopy: Record<
  Lang,
  {
    eyebrow: string;
    title: string;
    intro: string;
    bullets: { icon: string; text: string }[];
    frequency: string;
    formTitle: string;
    formNote: string;
  }
> = {
  en: {
    eyebrow: "Newsletter",
    title: "Fresh ideas for curious kids, delivered",
    intro:
      "Spend less time searching for what to do next and more time exploring together. Our short newsletter brings the newest hands-on STEM activities, thoughtful child-development reads and useful free resources into one place.",
    bullets: [
      { icon: "🧪", text: "Clear STEM activities using materials you often already have" },
      {
        icon: "🧭",
        text: "Warm, science-backed guidance on child development and parenting",
      },
      {
        icon: "🎁",
        text: "Free printables, e-books and new interactive tools",
      },
    ],
    frequency:
      "Once or twice a month. No spam, and you can unsubscribe anytime.",
    formTitle: "Join the curious list",
    formNote: "Enter your email, then confirm it from your inbox. That’s it.",
  },
  hr: {
    eyebrow: "Newsletter",
    title: "Svježe ideje za znatiželjnu djecu, ravno u inbox",
    intro:
      "Manje vremena tražite što raditi, a više vremena provedite istražujući zajedno. U kratkom newsletteru donosimo najnovije praktične STEM aktivnosti, korisne tekstove o razvoju djeteta i besplatne materijale na jednom mjestu.",
    bullets: [
      { icon: "🧪", text: "Jasne STEM aktivnosti s priborom koji često već imate" },
      {
        icon: "🧭",
        text: "Topli, znanstveno utemeljeni tekstovi o razvoju djeteta i roditeljstvu",
      },
      {
        icon: "🎁",
        text: "Besplatni materijali za ispis, e-knjige i novi interaktivni alati",
      },
    ],
    frequency:
      "Jednom do dvaput mjesečno. Bez spama, uz odjavu u svakom trenutku.",
    formTitle: "Pridružite se znatiželjnoj ekipi",
    formNote: "Unesite email i zatim ga potvrdite iz svog inboxa. To je sve.",
  },
};

/**
 * Split one already-safe article chunk at the heading closest to its middle.
 * Article pages use this to place the newsletter between real sections rather
 * than at the very end. Heading-only cuts keep MDX/JSX blocks intact.
 */
export function splitContentForNewsletter(content: string): string[] {
  const lines = content.split("\n");
  const h2Lines: number[] = [];
  const h3Lines: number[] = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^## \S/.test(lines[i])) h2Lines.push(i);
    else if (/^### \S/.test(lines[i])) h3Lines.push(i);
  }

  const candidates = h2Lines.length > 1 ? h2Lines : h3Lines;
  const countWords = (value: string) =>
    value.replace(/<[^>]*>/g, " ").match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
  const totalWords = countWords(content);
  const minimumSide = Math.min(100, Math.floor(totalWords * 0.25));
  let best: { line: number; distance: number } | null = null;

  for (const line of candidates) {
    const wordsBefore = countWords(lines.slice(0, line).join("\n"));
    const wordsAfter = totalWords - wordsBefore;
    if (wordsBefore < minimumSide || wordsAfter < minimumSide) continue;
    const distance = Math.abs(wordsBefore / totalWords - 0.5);
    if (!best || distance < best.distance) best = { line, distance };
  }

  if (!best) return [content];
  return [
    lines.slice(0, best.line).join("\n"),
    lines.slice(best.line).join("\n"),
  ];
}

/** Copy for the two post-signup status pages (thank-you + welcome). */
export const statusCopy: Record<
  "thankYou" | "welcome",
  Record<Lang, { emoji: string; title: string; body: string }>
> = {
  thankYou: {
    en: {
      emoji: "📬",
      title: "Almost there - check your inbox",
      body: "We've just sent you a confirmation email. Click the link inside to complete your subscription; nothing arrives until you do. If it hasn't shown up in a few minutes, peek into your spam or promotions folder.",
    },
    hr: {
      emoji: "📬",
      title: "Još jedan korak - provjerite inbox",
      body: "Upravo smo vam poslali email s potvrdom. Kliknite poveznicu u njemu kako biste dovršili pretplatu; dok to ne učinite, newsletter ne stiže. Ako se ne pojavi za nekoliko minuta, provjerite spam ili mapu promocija.",
    },
  },
  welcome: {
    en: {
      emoji: "🎉",
      title: "Subscription confirmed, welcome aboard!",
      body: "You're on the list. From now on, new experiments, activities and Mind Explorers articles land straight in your inbox. To make sure we never end up in spam, add our address to your contacts.",
    },
    hr: {
      emoji: "🎉",
      title: "Pretplata potvrđena, dobro došli!",
      body: "Na popisu ste. Od sada novi pokusi, aktivnosti i Mind Explorers članci stižu ravno u vaš inbox. Da nikad ne završimo u spamu, dodajte našu adresu u svoje kontakte.",
    },
  },
};

/** "Keep exploring" section shared by both status pages. */
export const exploreCopy: Record<
  Lang,
  { heading: string; cards: { icon: string; title: string; blurb: string; href: string }[] }
> = {
  en: {
    heading: "In the meantime, keep exploring",
    cards: [
      {
        icon: "🔬",
        title: "Activities",
        blurb: "Browse every experiment and hands-on activity on the site.",
        href: "/en/activities",
      },
      {
        icon: "🎮",
        title: "Tools & games",
        blurb: "Free interactive tools your kids can play with right in the browser.",
        href: "/en/tools",
      },
      {
        icon: "🧭",
        title: "Mind Explorers",
        blurb: "Child psychology and parenting, explained warmly and backed by science.",
        href: "/en/minds",
      },
    ],
  },
  hr: {
    heading: "U međuvremenu, nastavite istraživati",
    cards: [
      {
        icon: "🔬",
        title: "Aktivnosti",
        blurb: "Pregledajte sve pokuse i praktične aktivnosti na stranici.",
        href: "/hr/activities",
      },
      {
        icon: "🎮",
        title: "Alati i igre",
        blurb: "Besplatni interaktivni alati s kojima se djeca mogu igrati ravno u pregledniku.",
        href: "/hr/alati",
      },
      {
        icon: "🧭",
        title: "Mind Explorers",
        blurb: "Dječja psihologija i roditeljstvo, objašnjeni toplo i utemeljeni na znanosti.",
        href: "/hr/um",
      },
    ],
  },
};
