import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActivitiesClient from "@/components/ActivitiesClient";
import { getPostsByTag } from "@/lib/posts";

export const metadata: Metadata = {
  title: "STEM Aktivnosti za Djecu | STEM Little Explorers",
  description:
    "Pregledajte praktične STEM aktivnosti i eksperimente za djecu — znanost, inženjerstvo, matematika, tehnologija i više. Filtrirajte po predmetu.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr/activities",
    languages: {
      en: "https://stemlittleexplorers.com/en/activities",
      hr: "https://stemlittleexplorers.com/hr/activities",
    },
  },
};

export default function ActivitiesPage() {
  const posts = getPostsByTag("hr", "activity");

  return (
    <>
      <Header lang="hr" switchUrl="/en/activities" />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            ⚡ Aktivnosti
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Praktični eksperimenti i projekti koje možete isprobati kod kuće ili
            u razredu — bez posebne opreme.
          </p>
        </div>

        <ActivitiesClient posts={posts} lang="hr" />
      </main>
      <Footer lang="hr" />
    </>
  );
}
