import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";
import { authors } from "@/lib/authors";

export const metadata: Metadata = {
  title: "O nama | STEM Little Explorers",
  description:
    "Upoznajte tim iza STEM Little Explorers — praktične STEM aktivnosti i vodiči za razvoj djeteta za roditelje i odgajatelje.",
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
      <Header lang="hr" switchUrl="/en/about" />
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-10">

        <h1 className="text-3xl font-bold mb-4">O projektu STEM Little Explorers</h1>

        <p className="text-lg leading-relaxed text-gray-700 mb-4">
          STEM Little Explorers dvojezični je blog (hrvatski i engleski) posvećen
          tome da svaka obitelj ima pristup sadržajima o znanosti, tehnologiji,
          inženjerstvu, matematici i dječjoj psihologiji. Vjerujemo da je znatiželja
          djetetova najveća supermoć — i da su roditelji i odgajatelji ti koji je
          najljepše mogu njegovati.
        </p>

        <p className="text-gray-700 mb-4">
          Svaki članak temelji se na stvarnim istraživanjima, ali pisan je
          razumljivim jezikom — kako biste ideju mogli pokupit u utorak navečer i
          isprobati je u srijedu ujutro, bez posebne opreme ili stručnog znanja.
        </p>

        <p className="text-gray-700 mb-10">
          Tražite li brzi pokus, vodič o razvojnom stadiju ili savjet iz psihologije
          odgoja — sve to pronađite ovdje, na hrvatskom i engleskom jeziku.
        </p>

        {/* Authors section */}
        <h2 className="text-2xl font-bold mb-6">Upoznajte autore</h2>

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
                <p className="text-sm text-indigo-600 mb-2">{author.roleHr}</p>
                <p className="text-gray-600 leading-relaxed">{author.bioHr}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-indigo-50 rounded-xl">
          <h2 className="text-xl font-bold mb-2">Kontaktirajte nas</h2>
          <p className="text-gray-700 mb-4">
            Imate pitanje, prijedlog teme ili samo želite pozdraviti?
          </p>
          <a
            href="/hr/contact"
            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Kontakt →
          </a>
        </div>

      </main>
      <Footer lang="hr" />
    </>
  );
}
