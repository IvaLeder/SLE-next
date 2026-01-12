import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About STEM Little Explorers",
  description: "Learn more about our blog and mission",
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
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">About STEM Little Explorers</h1>
      <p className="text-lg leading-relaxed text-gray-700">
        STEM Little Explorers is a space for young minds to discover science,
        technology, engineering, and math through creativity and play. Our
        mission is to make learning exciting, inclusive, and accessible for
        every curious child.
      </p>
      <p className="mt-4 text-gray-700">
        Here you’ll find articles, projects, and experiments that inspire
        exploration and learning — both in English and Croatian.
      </p>
    </div>
  );
}