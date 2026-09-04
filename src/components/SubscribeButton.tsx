import Link from "next/link";
import { newsletterHref } from "@/lib/newsletter";

const LABEL: Record<"en" | "hr", string> = {
  en: "Get fresh ideas",
  hr: "Želim nove ideje",
};

export function SubscribeButton({ lang = "en" }: { lang?: "en" | "hr" }) {
  return (
    <Link
      href={newsletterHref(lang, "mdx")}
      data-analytics-event="newsletter_cta_click"
      data-analytics-source="mdx"
      data-analytics-placement="article-body"
      className="inline-block px-4 py-2 rounded-lg bg-newsletter hover:bg-newsletter-hover text-white text-sm font-medium font-sans transition-colors"
    >
      {LABEL[lang]}
    </Link>
  );
}
