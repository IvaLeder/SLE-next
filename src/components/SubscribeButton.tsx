const MC_URL =
  "https://stemlittleexplorers.us15.list-manage.com/subscribe?u=375a897a3f9418343fcbaf481&id=aef7a43083";

const LABEL: Record<"en" | "hr", string> = {
  en: "Subscribe to Newsletter",
  hr: "Pretplati se na newsletter",
};

export function SubscribeButton({ lang = "en" }: { lang?: "en" | "hr" }) {
  return (
    <a
      href={MC_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium transition"
    >
      {LABEL[lang]}
    </a>
  );
}
