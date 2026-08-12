import Link from "next/link";
import NewsletterSignupForm from "./NewsletterSignupForm";
import { SUBSCRIBE_SLUG, type Lang } from "@/lib/newsletter";

const COPY = {
  en: {
    home: {
      eyebrow: "A little inspiration in your inbox",
      title: "Fresh ideas for curious kids, ready when you are",
      body: "Hands-on STEM activities, thoughtful parenting reads and useful free printables — in one calm email, once or twice a month.",
    },
    article: {
      eyebrow: "Keep the curiosity going",
      title: "Get the next activity in your inbox",
      body: "Join parents and educators who want practical STEM ideas, child-development insights and free resources without the inbox clutter.",
    },
    more: "See what you’ll get",
  },
  hr: {
    home: {
      eyebrow: "Malo inspiracije u vašem inboxu",
      title: "Svježe ideje za znatiželjnu djecu, uvijek pri ruci",
      body: "Praktične STEM aktivnosti, korisni tekstovi za roditelje i besplatni materijali — u jednom kratkom emailu, jednom do dvaput mjesečno.",
    },
    article: {
      eyebrow: "Nastavite poticati znatiželju",
      title: "Primite sljedeću aktivnost u inbox",
      body: "Pridružite se roditeljima i edukatorima koji žele praktične STEM ideje, savjete o razvoju djeteta i besplatne materijale bez zatrpanog inboxa.",
    },
    more: "Pogledajte što ćete dobivati",
  },
} as const;

export default function NewsletterPromo({
  lang,
  placement,
}: {
  lang: Lang;
  placement: "home" | "article";
}) {
  const t = COPY[lang];
  const c = t[placement];
  const headingId = `newsletter-${placement}-heading`;

  return (
    <section
      data-no-print
      aria-labelledby={headingId}
      className={`not-prose overflow-hidden rounded-3xl border border-brand/15 bg-gradient-to-br from-brand-soft/80 via-white to-white shadow-sm ${
        placement === "home" ? "mb-12" : "my-10 xl:hidden"
      }`}
    >
      <div className="grid items-center gap-6 p-6 md:grid-cols-[1.15fr_0.85fr] md:p-8">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-brand/10"
          >
            📨
          </span>
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-brand">
              {c.eyebrow}
            </p>
            <h2 id={headingId} className="mt-1 font-sans text-xl font-bold leading-tight text-gray-900 md:text-2xl">
              {c.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">{c.body}</p>
            <Link
              href={`/${lang}/${SUBSCRIBE_SLUG[lang]}`}
              className="mt-3 inline-block font-sans text-sm font-semibold text-brand hover:text-brand-hover hover:underline"
            >
              {t.more} →
            </Link>
          </div>
        </div>

        <NewsletterSignupForm
          lang={lang}
          variant="compact"
          source={placement}
          compactLayout="inline"
        />
      </div>
    </section>
  );
}
