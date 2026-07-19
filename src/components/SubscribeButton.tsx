import Link from "next/link";
import { SUBSCRIBE_SLUG } from "@/lib/newsletter";

const LABEL: Record<"en" | "hr", string> = {
  en: "Subscribe to Newsletter",
  hr: "Pretplati se na newsletter",
};

export function SubscribeButton({ lang = "en" }: { lang?: "en" | "hr" }) {
  return (
    <Link
      href={`/${lang}/${SUBSCRIBE_SLUG[lang]}`}
      className="inline-block px-4 py-2 rounded-lg bg-newsletter hover:bg-newsletter-hover text-white text-sm font-medium font-sans transition-colors"
    >
      {LABEL[lang]}
    </Link>
  );
}
