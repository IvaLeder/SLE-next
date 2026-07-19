import NewsletterSignupForm from "./NewsletterSignupForm";
import { subscribeCopy, type Lang } from "@/lib/newsletter";

// Body of the subscribe landing pages (/en/subscribe + /hr/pretplata):
// value proposition on the left, the signup form in a card on the right.
export default function SubscribeLanding({ lang }: { lang: Lang }) {
  const c = subscribeCopy[lang];

  return (
    <div className="grid items-start gap-10 md:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="font-sans text-sm font-semibold uppercase tracking-wide text-newsletter">
          {c.eyebrow}
        </p>
        <h1 className="mt-2 font-sans text-3xl font-bold text-gray-900 sm:text-4xl">
          {c.title}
        </h1>
        <p className="mt-4 leading-relaxed text-gray-600">{c.intro}</p>

        <ul className="mt-6 space-y-4">
          {c.bullets.map((b) => (
            <li key={b.icon} className="flex items-start gap-3">
              <span aria-hidden="true" className="text-2xl">
                {b.icon}
              </span>
              <span className="leading-relaxed text-gray-700">{b.text}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 font-sans text-sm text-gray-500">{c.frequency}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <NewsletterSignupForm lang={lang} />
      </div>
    </div>
  );
}
