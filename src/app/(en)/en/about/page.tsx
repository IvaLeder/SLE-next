import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { authors, authorSlug } from "@/lib/authors";
import { generateAuthorsJsonLd } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "About | STEM Little Explorers",
  description:
    "Meet the team behind STEM Little Explorers — practical STEM activities and child development guides for parents and educators.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/en/about",
    languages: {
      en: "https://stemlittleexplorers.com/en/about",
      hr: "https://stemlittleexplorers.com/hr/about",
    },
  },
};

export default function AboutPage() {
  return (
    <>
      {generateAuthorsJsonLd("en").map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <Header lang="en" switchUrl="/hr/about" />
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-12">
        {/* Intro */}
        <header className="mb-12">
          <p className="font-sans text-sm font-semibold uppercase tracking-wide text-brand mb-3">
            About us
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
            Making STEM fun for every family
          </h1>
          <p className="text-lg leading-relaxed text-gray-700">
            STEM Little Explorers is a bilingual blog — in English and Croatian —
            that makes science, technology, engineering, maths and child
            psychology accessible to every family. We believe curiosity is a
            child&rsquo;s greatest superpower, and that parents and educators are
            the best people to nurture it.
          </p>
        </header>

        {/* Mission + Vision */}
        <section className="grid gap-5 sm:grid-cols-2 mb-12">
          <div className="rounded-2xl bg-brand-soft p-6">
            <h2 className="font-sans text-lg font-bold text-brand mb-2">
              Our mission
            </h2>
            <p className="text-gray-700 leading-relaxed">
              To give parents and educators simple, affordable ideas for
              sparking STEM skills in children. Science, technology, engineering
              and maths shape the future — and they don&rsquo;t have to feel
              intimidating. We show how they can be playful, hands-on and
              genuinely fun, so you can help that spark grow and keep it lit.
            </p>
          </div>
          <div className="rounded-2xl bg-gray-100 p-6">
            <h2 className="font-sans text-lg font-bold text-gray-900 mb-2">
              Our vision
            </h2>
            <p className="text-gray-700 leading-relaxed">
              To be the go-to place for cheap, easy and fun STEM activities. We
              champion learning by doing — children who explore, build and
              experiment rather than just watch or listen — and we want every
              child to meet STEM early, because the world will only ask for more
              of it.
            </p>
          </div>
        </section>

        <p className="text-gray-700 leading-relaxed mb-14">
          Whether you&rsquo;re after a quick science experiment, a guide to a
          developmental milestone, or an evidence-based parenting tip —
          you&rsquo;ll find it here.
        </p>

        {/* Authors */}
        <section>
          <h2 className="font-sans text-2xl font-bold mb-6">Meet the authors</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {Object.values(authors).map((author) => {
              const firstName = author.name.split(" ")[0];
              return (
                <article
                  key={author.name}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {author.avatar ? (
                      <Image
                        src={author.avatar}
                        alt={author.name}
                        width={72}
                        height={72}
                        className="h-[72px] w-[72px] flex-shrink-0 rounded-full object-cover ring-2 ring-brand-soft"
                      />
                    ) : (
                      <div
                        className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-brand"
                        aria-hidden="true"
                      >
                        {author.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-sans text-lg font-semibold text-gray-900">
                        {author.name}
                      </p>
                      <p className="font-sans text-sm text-brand">
                        {author.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-[15px] leading-relaxed text-gray-600">
                    {author.bio}
                  </p>
                  <Link
                    href={`/en/author/${authorSlug(author.name)}`}
                    className="mt-4 inline-block font-sans text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
                  >
                    More from {firstName} →
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* Contact CTA */}
        <div className="mt-14 rounded-2xl bg-brand-soft p-8 text-center">
          <h2 className="font-sans text-xl font-bold mb-2">Get in touch</h2>
          <p className="text-gray-700 mb-5">
            Have a question, a topic suggestion or just want to say hello?
          </p>
          <Link
            href="/en/contact"
            className="inline-block rounded-lg bg-brand px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Contact us →
          </Link>
        </div>
      </main>
      <Footer lang="en" />
    </>
  );
}
