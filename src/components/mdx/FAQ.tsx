import React from "react";
import { extractText } from "./Steps";

interface QuestionProps {
  /** The question text, shown as the clickable summary row. */
  question: string;
  children?: React.ReactNode;
}

/**
 * One Q&A pair inside <FAQ>. Native <details>/<summary> — collapsible with
 * zero client JS. The fallback body below only renders outside <FAQ>.
 */
export function Question({ question, children }: QuestionProps) {
  return (
    <div>
      <strong className="font-sans">{question}</strong>
      {children}
    </div>
  );
}

/**
 * FAQ block with schema.org FAQPage structured data for rich results:
 *
 *   <FAQ>
 *   <Question question="How long does this take?">About 15 minutes…</Question>
 *   <Question question="Is it safe indoors?">Yes, as long as…</Question>
 *   </FAQ>
 *
 * Questions are child elements with string props (next-mdx-remote drops
 * array/object props — see Materials.tsx). Answers are ordinary markdown and
 * keep prose styling. Note: collapsed answers don't show up in print — put
 * must-print info in the article body or a Callout instead.
 */
export default function FAQ({ children }: { children?: React.ReactNode }) {
  const items = React.Children.toArray(children).filter(
    (c): c is React.ReactElement<QuestionProps> =>
      React.isValidElement(c) && c.type === Question
  );

  if (items.length === 0) return null;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.props.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: extractText(item.props.children).replace(/\s+/g, " ").trim(),
      },
    })),
    // "<" must not appear raw inside a <script> tag
  }).replace(/</g, "\\u003c");

  return (
    <div className="my-8 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
      {items.map((item, i) => (
        <details key={i} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-sans text-base font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
            {item.props.question}
            <span
              aria-hidden="true"
              className="shrink-0 text-brand transition-transform group-open:rotate-45"
            >
              ＋
            </span>
          </summary>
          <div className="pt-3 text-[0.95em] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {item.props.children}
          </div>
        </details>
      ))}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    </div>
  );
}
