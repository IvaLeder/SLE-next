import React from "react";
import { type Lang } from "@/lib/affiliate";

const COPY = {
  en: { step: "Step" },
  hr: { step: "Korak" },
} as const;

interface StepProps {
  /** Short imperative heading, e.g. "Mix the colors" */
  title?: string;
  children?: React.ReactNode;
}

/**
 * One instruction inside <Steps>. Authored as a child element with string
 * props (next-mdx-remote drops array/object props — see Materials.tsx):
 *
 *   <Steps title="How to make colored rice">
 *   <Step title="Prepare the bags">Put one cup of rice in each bag…</Step>
 *   <Step>Add a few drops of food coloring.</Step>
 *   </Steps>
 *
 * <Steps> reads each Step's props and renders the numbered layout itself; the
 * fallback body below only shows if a Step is used outside <Steps>.
 */
export function Step({ title, children }: StepProps) {
  return (
    <div>
      {title && <strong className="font-sans">{title}</strong>}
      {children}
    </div>
  );
}

/** Pull plain text out of rendered MDX children for JSON-LD (also used by FAQ). */
export function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node))
    // join with a space (paragraph boundaries), then tidy space-before-punctuation
    return node.map(extractText).join(" ").replace(/\s+([.,!?;:])/g, "$1");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

interface StepsProps {
  lang?: Lang;
  /** Name of the whole activity. When set, HowTo JSON-LD is emitted for rich
   *  results — so don't add a separate heading right above the component. */
  title?: string;
  children?: React.ReactNode;
}

/**
 * Numbered step-by-step instructions with big friendly numbers and, when a
 * `title` is given, schema.org HowTo structured data for SEO rich results.
 *
 * Not `not-prose`: step bodies are article prose and should keep typography
 * styling; the list chrome is overridden with utilities instead. Prints
 * cleanly — numbers fall back to bordered circles with dark text.
 */
export default function Steps({ lang = "en", title, children }: StepsProps) {
  const steps = React.Children.toArray(children).filter(
    (c): c is React.ReactElement<StepProps> =>
      React.isValidElement(c) && c.type === Step
  );

  if (steps.length === 0) return null;

  const jsonLd = title
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: title,
        step: steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.props.title ?? `${COPY[lang].step} ${i + 1}`,
          text: extractText(s.props.children).replace(/\s+/g, " ").trim(),
        })),
        // "<" must not appear raw inside a <script> tag
      }).replace(/</g, "\\u003c")
    : null;

  return (
    <div className="my-10">
      {title && (
        <p className="mb-6 font-sans text-lg font-bold text-gray-900">
          📋 {title}
        </p>
      )}

      <ol role="list" className="my-0 list-none space-y-0 pl-0">
        {steps.map((s, i) => (
          <li key={i} className="relative my-0 pb-8 pl-14 last:pb-0">
            <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-brand font-sans text-base font-bold text-white print:border print:border-gray-400 print:bg-white print:text-gray-900">
              {i + 1}
            </span>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute bottom-1 left-[17px] top-11 w-0.5 rounded bg-brand-soft print:hidden"
              />
            )}

            {s.props.title && (
              <p className="mb-2 mt-0 pt-1.5 font-sans text-base font-bold leading-snug text-gray-900">
                {s.props.title}
              </p>
            )}
            <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              {s.props.children}
            </div>
          </li>
        ))}
      </ol>

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}
    </div>
  );
}
