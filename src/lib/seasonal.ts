import { BACK_TO_SCHOOL_SLUG } from "./back-to-school";

export type SeasonalLang = "en" | "hr";

type BannerCopy = { eyebrow: string; title: string; body: string; cta: string; note: string };

export type SeasonalCampaign = {
  id: string;
  /** Landing-page slug per language (`/{lang}/{slug}`). */
  slug: Record<SeasonalLang, string>;
  /**
   * Banner window as "MM-DD" (inclusive), evaluated once at BUILD time, so a
   * campaign switches over on the first deploy inside its window. Windows
   * may wrap the new year (e.g. "12-01" → "01-06"). The landing pages stay
   * live all year; only the banner is seasonal.
   */
  window: { start: string; end: string };
  /**
   * False while the landing page is unpublished: the campaign is skipped even
   * inside its window, so the banner never links to a page that isn't live.
   * Flip to true in the same commit that publishes the landing page.
   */
  live: boolean;
  icon: string;
  /** CSS background for the banner. */
  background: string;
  /** Faint texture laid over the background. */
  texture: string;
  /** Muted text colour for the eyebrow, body and note. */
  muted: string;
  /** CTA pill text colour (on white). */
  ctaColor: string;
  banner: Record<SeasonalLang, BannerCopy>;
};

/**
 * Seasonal campaigns, in calendar order. One entry per seasonal landing page;
 * `SeasonalBanner` shows whichever one's window contains the build date. To
 * add Christmas: build its landing page, then add an entry here.
 */
export const CAMPAIGNS: SeasonalCampaign[] = [
  {
    id: "back-to-school",
    slug: BACK_TO_SCHOOL_SLUG,
    window: { start: "08-10", end: "09-30" },
    live: true,
    icon: "🎒",
    background: "linear-gradient(135deg, #3730A3 0%, #6D4DB3 58%, #D95770 100%)",
    texture:
      "linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)",
    muted: "#E0E7FF",
    ctaColor: "#3730A3",
    banner: {
      en: {
        eyebrow: "Free back-to-school toolkit",
        title: "Curious, calm and ready for school",
        body: "Readiness, gentler routines, learning help and an 8-page printable.",
        cta: "Explore the guide →",
        note: "Free · no sign-up",
      },
      hr: {
        eyebrow: "Besplatan paket za početak škole",
        title: "Znatiželjno, mirno i spremno za školu",
        body: "Spremnost, nježnije rutine, pomoć pri učenju i paket od 8 stranica.",
        cta: "Istražite naš vodič →",
        note: "Besplatno · bez registracije",
      },
    },
  },
  {
    id: "pumpkins-and-potions",
    slug: { en: "pumpkins-and-potions", hr: "bundeve-i-carobni-napici" },
    window: { start: "10-01", end: "11-08" },
    live: false,
    icon: "🎃",
    background: "linear-gradient(135deg, #17121F 0%, #2B1B45 48%, #5B2A6E 78%, #C2591A 100%)",
    texture: "radial-gradient(rgba(255,214,150,.22) 1px, transparent 1.5px)",
    muted: "#E9DDF7",
    ctaColor: "#2B1B45",
    banner: {
      en: {
        eyebrow: "Autumn science lab",
        title: "Pumpkins & Potions",
        body: "Gooey slime, bubbling cauldrons and glowing eyeballs, all with real science inside.",
        cta: "Enter the lab →",
        note: "Kitchen ingredients · ages 2+",
      },
      hr: {
        eyebrow: "Jesenski znanstveni laboratorij",
        title: "Bundeve i čarobni napici",
        body: "Ljepljiva sluz, pjenušavi kotlići i jaje koje svijetli, a sve to uz malo znanosti.",
        cta: "Uđite u laboratorij →",
        note: "Sastojci iz kuhinje · od 2 godine",
      },
    },
  },
];

export const PUMPKINS = CAMPAIGNS.find((c) => c.id === "pumpkins-and-potions")!;

function inWindow({ start, end }: SeasonalCampaign["window"], mmdd: string): boolean {
  return start <= end ? mmdd >= start && mmdd <= end : mmdd >= start || mmdd <= end;
}

export function getActiveCampaign(date: Date): SeasonalCampaign | null {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return CAMPAIGNS.find((c) => c.live && inWindow(c.window, mmdd)) ?? null;
}

/** Resolved once per build (module scope keeps render pure). */
export const ACTIVE_CAMPAIGN = getActiveCampaign(new Date());
