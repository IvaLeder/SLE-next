import NewsletterSignupForm from "./NewsletterSignupForm";

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
  const label = lang === "hr" ? "Nove objave u inbox!" : "Get new posts!";

  return (
    <aside
      className="hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 z-40 w-52"
      aria-label={label}
    >
      <div className="p-4 rounded-2xl shadow-md border border-neutral-200 bg-white text-center">
        <div className="flex items-center justify-center gap-2">
          <span aria-hidden="true" className="text-xl">📨</span>
          <span className="font-semibold text-sm">{label}</span>
        </div>
        <div className="mt-3">
          <NewsletterSignupForm lang={lang} variant="compact" source="floating" />
        </div>
      </div>
    </aside>
  );
}
