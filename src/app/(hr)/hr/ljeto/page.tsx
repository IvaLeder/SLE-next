import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SummerLanding from "@/components/SummerLanding";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ljeto znatiželje — besplatna ljetna STEM e-knjiga | STEM Little Explorers",
  description:
    "Besplatna e-knjiga s 30+ ljetnih znanstvenih aktivnosti za djecu bez ekrana — senzorna igra, pokusi u dvorištu i pravi STEM izazovi. Preuzmite PDF odmah, bez emaila i registracije.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr/ljeto",
    languages: {
      en: "https://stemlittleexplorers.com/en/summer",
      hr: "https://stemlittleexplorers.com/hr/ljeto",
    },
  },
};

export default function LjetoPage() {
  return (
    <>
      <Header lang="hr" switchUrl="/en/summer" />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <SummerLanding lang="hr" />
      </main>
      <Footer lang="hr" />
    </>
  );
}
