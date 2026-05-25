import Link from "next/link";

export default function Footer({ lang }: { lang: "en" | "hr" }) {
  const t = {
    en: {
      about: "About",
      aboutText: "STEM activities and psychology insights for kids and parents.",
      nav: "Navigation",
      home: "Home",
      aboutPage: "About",
      contact: "Contact",
      legal: "Legal",
      privacy: "Privacy Policy",
      terms: "Terms of Use",
      rss: "RSS Feed",
    },
    hr: {
      about: "O nama",
      aboutText: "STEM aktivnosti i psihološki savjeti za djecu i roditelje.",
      nav: "Navigacija",
      home: "Naslovnica",
      aboutPage: "O nama",
      contact: "Kontakt",
      legal: "Pravne informacije",
      privacy: "Politika privatnosti",
      terms: "Uvjeti korištenja",
      rss: "RSS feed",
    },
  }[lang];

  return (
    <footer className="mt-16 border-t bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 text-sm grid gap-6 md:grid-cols-3">

        {/* Brand blurb */}
        <div>
          <h3 className="font-semibold mb-2">{t.about}</h3>
          <p className="text-gray-600">{t.aboutText}</p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-semibold mb-2">{t.nav}</h3>
          <ul className="space-y-1">
            <li>
              <Link href={`/${lang}`} className="hover:underline">
                {t.home}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/about`} className="hover:underline">
                {t.aboutPage}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/contact`} className="hover:underline">
                {t.contact}
              </Link>
            </li>
            {/* Issue 13: surface the RSS feed so visitors can subscribe via readers */}
            <li>
              <a
                href={`/rss-${lang}.xml`}
                className="hover:underline"
                type="application/rss+xml"
              >
                {t.rss}
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-semibold mb-2">{t.legal}</h3>
          <ul className="space-y-1">
            {/* Issue 14: links now point to pages that exist */}
            <li>
              <Link href={`/${lang}/privacy`} className="hover:underline">
                {t.privacy}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/terms`} className="hover:underline">
                {t.terms}
              </Link>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} STEM Little Explorers
      </div>
    </footer>
  );
}
