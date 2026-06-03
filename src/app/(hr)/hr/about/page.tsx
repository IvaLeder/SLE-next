import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { authors, authorSlug } from "@/lib/authors";
import { generateAuthorsJsonLd } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "O nama | STEM Little Explorers",
  description:
    "Upoznajte tim iza STEM Little Explorers koji smišljaju praktične STEM aktivnosti i vodiče za razvoj djeteta za roditelje i odgajatelje.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr/about",
    languages: {
      en: "https://stemlittleexplorers.com/en/about",
      hr: "https://stemlittleexplorers.com/hr/about",
    },
  },
};

export default function AboutPage() {
  return (
    <>
      {generateAuthorsJsonLd("hr").map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <Header lang="hr" switchUrl="/en/about" />
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-12">
        {/* Uvod */}
        <header className="mb-12">
          <p className="font-sans text-sm font-semibold uppercase tracking-wide text-brand mb-3">
            O nama
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
            STEM zabavan za svaku obitelj
          </h1>
          <p className="text-lg leading-relaxed text-gray-700">
            STEM Little Explorers dvojezični je blog na hrvatskom i engleskom
            jeziku koji znanost, tehnologiju, inženjerstvo, matematiku i dječju
            psihologiju čini dostupnima svakoj obitelji. Vjerujemo da je
            znatiželja djetetova najveća supermoć i da su roditelji i
            odgajatelji ti koji je mogu najbolje njegovati.
          </p>
        </header>

        {/* Misija + Vizija */}
        <section className="grid gap-5 sm:grid-cols-2 mb-12">
          <div className="rounded-2xl bg-brand-soft p-6">
            <h2 className="font-sans text-lg font-bold text-brand mb-2">
              Naša misija
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Pružiti roditeljima i odgajateljima jednostavne i pristupačne
              ideje za poticanje STEM vještina kod djece. Znanost, tehnologija,
              inženjerstvo i matematika oblikuju budućnost i ne moraju izgledati
              zastrašujuće. Pokazujemo kako mogu biti razigrane, praktične i
              istinski zabavne.
            </p>
          </div>
          <div className="rounded-2xl bg-gray-100 p-6">
            <h2 className="font-sans text-lg font-bold text-gray-900 mb-2">
              Naša vizija
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Biti prvo mjesto za jeftine, jednostavne i zabavne STEM
              aktivnosti. Potičemo iskustveno učenje i djecu koja istražuju,
              grade i eksperimentiraju umjesto da samo gledaju ili slušaju.
              Želimo da svako dijete doživi znatiželju i
              radost otkrivanja i da njihovi odrasli imaju alate da im pomognu u
              tome.
            </p>
          </div>
        </section>

        <p className="text-gray-700 leading-relaxed mb-14">
          Tražite li brzi pokus, vodič kroz razvojni stadij ili savjet o odgoju
          utemeljen na dokazima? Sve to i još mnogo toga pronaći ćete ovdje, na STEM Little Explorers.
        </p>

        {/* Autori */}
        <section>
          <h2 className="font-sans text-2xl font-bold mb-6">
            Upoznajte autore
          </h2>
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
                        {author.roleHr}
                      </p>
                    </div>
                  </div>
                  <p className="text-[15px] leading-relaxed text-gray-600">
                    {author.bioHr}
                  </p>
                  <Link
                    href={`/hr/author/${authorSlug(author.name)}`}
                    className="mt-4 inline-block font-sans text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
                  >
                    Više od {firstName} →
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* Kontakt CTA */}
        <div className="mt-14 rounded-2xl bg-brand-soft p-8 text-center">
          <h2 className="font-sans text-xl font-bold mb-2">
            Kontaktirajte nas
          </h2>
          <p className="text-gray-700 mb-5">
            Imate pitanje, prijedlog teme ili samo želite pozdraviti?
          </p>
          <Link
            href="/hr/contact"
            className="inline-block rounded-lg bg-brand px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Kontakt →
          </Link>
        </div>
      </main>
      <Footer lang="hr" />
    </>
  );
}
