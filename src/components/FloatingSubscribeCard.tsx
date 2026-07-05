import { SubscribeForm } from "./SubscribeForm";

// Desktop-only floating subscribe card. On mobile we use the inline CTA at the
// end of the article (see (en|hr)/[slug]/page.tsx).
export default function FloatingSubscribeCard({
  lang = "en",
}: {
  lang?: "en" | "hr";
}) {
  const label = lang === "hr" ? "Nove objave u inbox!" : "Get new posts!";

  return (
    <aside
      className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-40 w-52"
      aria-label={label}
    >
      <div className="p-4 rounded-2xl shadow-md border border-neutral-200 bg-white flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-xl">📨</span>
          <span className="font-semibold text-sm">{label}</span>
        </div>
        <SubscribeForm lang={lang} />
      </div>
    </aside>
  );
}
