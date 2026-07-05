import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActivitiesClient from "@/components/ActivitiesClient";
import SpinActivityBand from "@/components/tools/SpinActivityBand";
import { getPostsByTag, toPostMeta } from "@/lib/posts";
import { getSpinActivities } from "@/lib/spin-activities";

export const metadata: Metadata = {
  title: "STEM Aktivnosti za Djecu | STEM Little Explorers",
  description:
    "Pregledajte praktične STEM aktivnosti i eksperimente za djecu — znanost, inženjerstvo, matematika, tehnologija i više. Filtrirajte po kategoriji.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr/activities",
    languages: {
      en: "https://stemlittleexplorers.com/en/activities",
      hr: "https://stemlittleexplorers.com/hr/activities",
    },
  },
};

export default function ActivitiesPage() {
  // Strip article bodies before crossing into the client <ActivitiesClient>.
  const posts = toPostMeta(getPostsByTag("hr", "activity"));

  return (
    <>
      <Header lang="hr" switchUrl="/en/activities" />
      <main id="main-content" className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            ⚡ Aktivnosti
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Praktični eksperimenti i projekti koje možete isprobati kod kuće ili
            u razredu — bez posebne opreme.
          </p>
        </div>

        <SpinActivityBand lang="hr" activities={getSpinActivities("hr")} />

        <ActivitiesClient posts={posts} lang="hr" />
      </main>
      <Footer lang="hr" />
    </>
  );
}
