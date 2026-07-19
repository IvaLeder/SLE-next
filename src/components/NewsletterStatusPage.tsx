import Link from "next/link";
import { statusCopy, exploreCopy, type Lang } from "@/lib/newsletter";

// Body of the two post-signup status pages: the thank-you page (after the
// on-site form submits — "confirm your email") and the welcome page (after the
// Mailchimp double-opt-in link is clicked). Each has its own URL purely so
// GTM/GA4 can count the two funnel steps as plain pageviews.
export default function NewsletterStatusPage({
  lang,
  kind,
}: {
  lang: Lang;
  kind: "thankYou" | "welcome";
}) {
  const c = statusCopy[kind][lang];
  const explore = exploreCopy[lang];

  return (
    <div className="text-center">
      <p aria-hidden="true" className="text-5xl">
        {c.emoji}
      </p>
      <h1 className="mt-4 font-sans text-3xl font-bold text-gray-900 sm:text-4xl">
        {c.title}
      </h1>
      <p className="mx-auto mt-4 max-w-xl leading-relaxed text-gray-600">{c.body}</p>

      <section className="mt-12">
        <h2 className="font-sans text-xl font-bold text-gray-900">{explore.heading}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {explore.cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
            >
              <span aria-hidden="true" className="text-3xl">
                {card.icon}
              </span>
              <p className="mt-2 font-sans font-semibold text-gray-900">{card.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{card.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
