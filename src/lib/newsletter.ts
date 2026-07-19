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
  }
> = {
  en: {
    eyebrow: "Newsletter",
    title: "Get new experiments in your inbox",
    intro:
      "Join the STEM Little Explorers newsletter and be the first to hear about our newest hands-on activities, free printables, and Mind Explorers, our corner on child psychology and parenting.",
    bullets: [
      { icon: "🧪", text: "Hands-on STEM experiments and activities for every age" },
      {
        icon: "🧭",
        text: "Mind Explorers: warm, science-backed reads on child psychology and parenting",
      },
      {
        icon: "🎁",
        text: "Free printables, e-books and interactive tools, before anyone else",
      },
    ],
    frequency:
      "About once or twice a month. No spam, and you can unsubscribe anytime.",
  },
  hr: {
    eyebrow: "Newsletter",
    title: "Novi pokusi ravno u vaš inbox",
    intro:
      "Pridružite se STEM Little Explorers newsletteru i prvi saznajte za naše najnovije praktične aktivnosti, besplatne materijale i Mind Explorers, naš kutak o dječjoj psihologiji i roditeljstvu.",
    bullets: [
      { icon: "🧪", text: "Praktični STEM pokusi i aktivnosti za svaku dob" },
      {
        icon: "🧭",
        text: "Mind Explorers: topli, znanstveno utemeljeni tekstovi o dječjoj psihologiji i roditeljstvu",
      },
      {
        icon: "🎁",
        text: "Besplatni materijali za ispis, e-knjige i interaktivni alati, prije svih",
      },
    ],
    frequency:
      "Otprilike jednom do dvaput mjesečno. Bez spama, a odjaviti se možete u svakom trenutku.",
  },
};

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
