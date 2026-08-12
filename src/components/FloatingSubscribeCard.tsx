import Link from "next/link";
import NewsletterSignupForm from "./NewsletterSignupForm";
import { SUBSCRIBE_SLUG } from "@/lib/newsletter";

// Desktop-only floating subscribe card. Below xl we use the inline CTA at the
// end of the article instead (see (en|hr)/[slug]/page.tsx) — at lg widths
// (1024-1279px) the fixed card would overlap the article text column, so the
// breakpoint is xl, not lg. Carries the compact form so readers can subscribe
// in place; source tag distinguishes it from the inline CTA in Mailchimp.
export default function FloatingSubscribeCard({
  lang = "en",
}: {
  lang?: "en" | "hr";
}) {
  const copy = lang === "hr"
    ? {
        label: "Ideje za znatiželjnu djecu",
        body: "Aktivnosti i besplatni materijali, 1–2× mjesečno.",
        more: "Što ćete dobivati?",
      }
    : {
        label: "Ideas for curious kids",
        body: "Activities and free printables, 1–2× a month.",
        more: "What will I get?",
      };

  return (
    <aside
      className="hidden xl:block fixed right-4 top-1/2 -translate-y-1/2 z-40 w-56"
      aria-label={copy.label}
    >
      <div className="p-4 rounded-2xl shadow-md border border-neutral-200 bg-white text-center">
        <span aria-hidden="true" className="text-2xl">📨</span>
        <p className="mt-1 font-sans text-sm font-bold leading-snug text-gray-900">{copy.label}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">{copy.body}</p>
        <div className="mt-3">
          <NewsletterSignupForm lang={lang} variant="compact" source="floating" />
        </div>
        <Link
          href={`/${lang}/${SUBSCRIBE_SLUG[lang]}`}
          className="mt-2 inline-block font-sans text-[11px] font-semibold text-brand hover:underline"
        >
          {copy.more} →
        </Link>
      </div>
    </aside>
  );
}
