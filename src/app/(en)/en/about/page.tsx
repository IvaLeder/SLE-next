import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import { Metadata } from "next";
import { authors } from "@/lib/authors";
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
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-10">

        <h1 className="text-3xl font-bold mb-4">About STEM Little Explorers</h1>

        <p className="text-lg leading-relaxed text-gray-700 mb-4">
          STEM Little Explorers is a bilingual blog (English & Croatian) dedicated to
          making science, technology, engineering, maths and child psychology
          accessible to every family. We believe that curiosity is a child&rsquo;s greatest
          superpower — and that parents and educators are the best people to nurture it.
        </p>

        <p className="text-gray-700 mb-4">
          Every article is grounded in real research but written in plain language,
          so you can pick up an idea on a Tuesday evening and try it on Wednesday
          morning with no special equipment or expertise required.
        </p>

        <p className="text-gray-700 mb-10">
          Whether you&rsquo;re looking for a quick science experiment, a guide to a
          developmental milestone, or an evidence-based parenting tip, you&rsquo;ll find
          it here — in English and Croatian.
        </p>

        {/* Authors section */}
        <h2 className="text-2xl font-bold mb-6">Meet the authors</h2>

        <div className="space-y-8">
          {Object.values(authors).map((author) => (
            <div key={author.name} className="flex gap-4 items-start">
              <div
                className="flex-shrink-0 w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl"
                aria-hidden="true"
              >
                {author.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{author.name}</p>
                <p className="text-sm text-indigo-600 mb-2">{author.role}</p>
                <p className="text-gray-600 leading-relaxed">{author.bio}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-indigo-50 rounded-xl">
          <h2 className="text-xl font-bold mb-2">Get in touch</h2>
          <p className="text-gray-700 mb-4">
            Have a question, a topic suggestion or just want to say hello?
          </p>
          <Link
            href="/en/contact"
            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Contact us →
          </Link>
        </div>

      </main>
      <Footer lang="en" />
    </>
  );
}
