import Link from "next/link";
import { ACTIVE_CAMPAIGN, type SeasonalLang } from "@/lib/seasonal";

/**
 * Seasonal promo shown under the homepage hero and article headers. Which
 * campaign it shows (or none) comes from the registry in `lib/seasonal.ts`,
 * resolved at build time.
 */
export default function SeasonalBanner({ lang }: { lang: SeasonalLang }) {
  const campaign = ACTIVE_CAMPAIGN;
  if (!campaign) return null;
  const copy = campaign.banner[lang];

  return (
    <Link
      href={`/${lang}/${campaign.slug[lang]}`}
      data-no-print
      data-campaign={campaign.id}
      className="group relative mx-auto mt-8 flex max-w-6xl flex-wrap items-center gap-3 overflow-hidden rounded-2xl px-5 py-4 text-white transition-transform hover:scale-[1.005] sm:flex-nowrap sm:gap-4 sm:px-6"
      style={{ background: campaign.background }}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ backgroundImage: campaign.texture, backgroundSize: "22px 22px" }}
        aria-hidden="true"
      />

      <span className="relative text-3xl leading-none sm:text-4xl" aria-hidden="true">{campaign.icon}</span>

      <div className="relative min-w-0 flex-1 basis-[calc(100%-3.25rem)] sm:basis-auto">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide" style={{ color: campaign.muted }}>
          {copy.eyebrow}
        </p>
        <p className="font-sans text-base font-bold leading-tight sm:text-lg">
          {copy.title}
        </p>
        <p className="mt-0.5 hidden text-sm leading-snug sm:block" style={{ color: campaign.muted }}>
          {copy.body}
        </p>
      </div>

      <span className="relative ml-auto flex w-full flex-none items-center justify-end gap-3 sm:ml-0 sm:w-auto sm:flex-col sm:gap-0">
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-sans text-sm font-semibold transition-transform group-hover:scale-[1.03]"
          style={{ color: campaign.ctaColor }}
        >
          {copy.cta}
        </span>
        <span className="font-sans text-[11px] sm:mt-1" style={{ color: campaign.muted }}>{copy.note}</span>
      </span>
    </Link>
  );
}
