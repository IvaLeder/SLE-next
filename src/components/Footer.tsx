import Link from "next/link";
import { siteConfig } from "@/config/site";
import { SURFACED_TAGS, TAG_DISPLAY } from "@/lib/tags";
import { TOOLS_SLUG } from "@/lib/tools";
import { MILESTONE_GUIDE_SLUG } from "@/lib/milestone-guide";
import CookieSettingsButton from "./CookieSettingsButton";

// Inline SVG icons — avoid pulling a whole icon library for four glyphs.
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.4v7A10 10 0 0 0 22 12Z"/>
    </svg>
  );
}
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function PinterestIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5.1s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.3-.9 3.5-.3 1.1.5 2 1.6 2 1.9 0 3.4-2 3.4-5 0-2.6-1.9-4.4-4.5-4.4-3.1 0-4.9 2.3-4.9 4.7 0 .9.3 1.9.8 2.5.1.1.1.2.1.3l-.3 1.3c0 .2-.2.3-.4.2-1.5-.7-2.4-2.9-2.4-4.6 0-3.8 2.7-7.2 7.8-7.2 4.1 0 7.3 2.9 7.3 6.8 0 4.1-2.6 7.4-6.2 7.4-1.2 0-2.4-.6-2.7-1.4l-.7 2.8c-.3 1-1 2.3-1.5 3a10 10 0 0 0 13-9.5A10 10 0 0 0 12 2Z"/>
    </svg>
  );
}
function YouTubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23 7.3a3 3 0 0 0-2.1-2.1C19 4.7 12 4.7 12 4.7s-7 0-8.9.5A3 3 0 0 0 1 7.3 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.7 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.5 12 31 31 0 0 0 23 7.3Zm-13 7.6V9.1l5.8 2.9-5.8 2.9Z"/>
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 2h-3v13.1a2.2 2.2 0 1 1-1.9-2.2v-3a5.2 5.2 0 1 0 4.9 5.2V9.7a6.9 6.9 0 0 0 4 1.3v-3a3.9 3.9 0 0 1-4-3.9V2Z"/>
    </svg>
  );
}

const CATEGORY_KEYS = ["science", "engineering", "math", "technology", "psychology"] as const;

export default function Footer({ lang }: { lang: "en" | "hr" }) {
  const t = {
    en: {
      tagline:     "STEM activities and psychology insights for kids and parents.",
      explore:     "Explore",
      activities:  "All activities",
      tools:       "Tools & games",
      guide:       "Baby milestones",
      subjects:    "Subjects",
      topics:      "Topics",
      allTopics:   "All topics",
      science:     "Science",
      engineering: "Engineering",
      math:        "Math",
      technology:  "Technology",
      psychology:  "Psychology",
      about:       "About",
      aboutPage:   "About us",
      contact:     "Contact",
      rss:         "RSS feed",
      legal:       "Legal",
      privacy:     "Privacy Policy",
      terms:       "Terms of Use",
      follow:      "Follow us",
      rights:      "All rights reserved.",
      madeWith:    "Made for curious kids.",
    },
    hr: {
      tagline:     "STEM aktivnosti i psihološki savjeti za djecu i roditelje.",
      explore:     "Istraži",
      activities:  "Sve aktivnosti",
      tools:       "Alati i igre",
      guide:       "Razvoj po mjesecima",
      subjects:    "Kategorije",
      topics:      "Teme",
      allTopics:   "Sve teme",
      science:     "Znanost",
      engineering: "Inženjerstvo",
      math:        "Matematika",
      technology:  "Tehnologija",
      psychology:  "Psihologija",
      about:       "O nama",
      aboutPage:   "O nama",
      contact:     "Kontakt",
      rss:         "RSS feed",
      legal:       "Pravne informacije",
      privacy:     "Politika privatnosti",
      terms:       "Uvjeti korištenja",
      follow:      "Pratite nas",
      rights:      "Sva prava pridržana.",
      madeWith:    "Stvoreno za znatiželjnu djecu.",
    },
  }[lang];

  // Hide social icons whose URLs are still placeholders (#).
  const socials = [
    { name: "Facebook",  href: siteConfig.social.facebook,  Icon: FacebookIcon },
    { name: "Instagram", href: siteConfig.social.instagram, Icon: InstagramIcon },
    { name: "Pinterest", href: siteConfig.social.pinterest, Icon: PinterestIcon },
    { name: "YouTube",   href: siteConfig.social.youtube,   Icon: YouTubeIcon },
    { name: "TikTok",    href: siteConfig.social.tiktok,    Icon: TikTokIcon },
  ]

  return (
    <footer className="mt-16 border-t bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-4 text-sm">

        {/* Brand + tagline + social */}
        <div className="md:col-span-1">
          <h3 className="font-bold text-base mb-2">{siteConfig.name}</h3>
          <p className="text-gray-600 leading-relaxed mb-4">{t.tagline}</p>

          {socials.length > 0 && (
            <>
              <p className="font-semibold text-xs uppercase tracking-wide text-gray-500 mb-2">
                {t.follow}
              </p>
              <div className="flex gap-3">
                {socials.map(({ name, href, Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:text-brand hover:border-brand transition"
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Explore — Activities + Subjects */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t.explore}</h3>
          <ul className="space-y-1.5">
            <li>
              <Link
                href={`/${lang}/activities`}
                className="text-brand hover:text-brand-hover hover:underline font-medium"
              >
                ⚡ {t.activities}
              </Link>
            </li>
            <li>
              <Link
                href={`/${lang}/${TOOLS_SLUG[lang]}`}
                className="text-brand hover:text-brand-hover hover:underline font-medium"
              >
                🧰 {t.tools}
              </Link>
            </li>
            <li>
              <Link
                href={`/${lang}/${MILESTONE_GUIDE_SLUG[lang]}`}
                className="text-brand hover:text-brand-hover hover:underline font-medium"
              >
                👶 {t.guide}
              </Link>
            </li>
          </ul>

          <h4 className="font-semibold mt-5 mb-2 text-xs uppercase tracking-wide text-gray-500">
            {t.subjects}
          </h4>
          <ul className="space-y-1.5">
            {CATEGORY_KEYS.map((key) => (
              <li key={key}>
                <Link
                  href={`/${lang}/category/${key}`}
                  className="text-gray-700 hover:text-brand hover:underline"
                >
                  {t[key]}
                </Link>
              </li>
            ))}
          </ul>

          <h4 className="font-semibold mt-5 mb-2 text-xs uppercase tracking-wide text-gray-500">
            {t.topics}
          </h4>
          <ul className="space-y-1.5">
            {SURFACED_TAGS.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/${lang}/tag/${slug}`}
                  className="text-gray-700 hover:text-brand hover:underline"
                >
                  {TAG_DISPLAY[lang][slug]}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/${lang}/topics`}
                className="text-brand hover:text-brand-hover hover:underline font-medium"
              >
                {t.allTopics} →
              </Link>
            </li>
          </ul>
        </div>

        {/* About */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t.about}</h3>
          <ul className="space-y-1.5">
            <li>
              <Link href={`/${lang}/about`} className="text-gray-700 hover:text-brand hover:underline">
                {t.aboutPage}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/contact`} className="text-gray-700 hover:text-brand hover:underline">
                {t.contact}
              </Link>
            </li>
            <li>
              <a
                href={`/rss-${lang}.xml`}
                type="application/rss+xml"
                className="text-gray-700 hover:text-brand hover:underline"
              >
                {t.rss}
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t.legal}</h3>
          <ul className="space-y-1.5">
            <li>
              <Link href={`/${lang}/privacy`} className="text-gray-700 hover:text-brand hover:underline">
                {t.privacy}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/terms`} className="text-gray-700 hover:text-brand hover:underline">
                {t.terms}
              </Link>
            </li>
            <li>
              <CookieSettingsButton lang={lang} />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {siteConfig.name}. {t.rights}</p>
          <p>{t.madeWith}</p>
        </div>
      </div>
    </footer>
  );
}
