import { SubscribeButton } from "./SubscribeButton";

// Desktop-only floating subscribe reminder (issue 24: mobile gets an inline
// CTA at the end of the article instead).
export default function FloatingSubscribeCard({
  lang = "en",
}: {
  lang?: "en" | "hr";
}) {
  const label = lang === "hr" ? "Nove objave u inbox!" : "Get new posts!";

  return (
    <div className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-40">
      <div className="w-52 p-4 rounded-2xl shadow-md border border-neutral-200 bg-white flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 justify-center">
          <span aria-hidden="true" className="text-xl">📨</span>
          <span className="font-semibold text-sm">{label}</span>
        </div>
        <SubscribeButton lang={lang} />
      </div>
    </div>
  );
}
