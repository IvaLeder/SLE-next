import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubscribeLanding from "@/components/SubscribeLanding";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pretplatite se na newsletter | STEM Little Explorers",
  description:
    "Primajte nove praktične STEM pokuse, Mind Explorers članke o dječjoj psihologiji i besplatne materijale u svoj inbox, otprilike jednom do dvaput mjesečno.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/hr/pretplata",
    languages: {
      en: "https://stemlittleexplorers.com/en/subscribe",
      hr: "https://stemlittleexplorers.com/hr/pretplata",
    },
  },
};

export default function PretplataPage() {
  return (
    <>
      <Header lang="hr" switchUrl="/en/subscribe" />
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-10">
        <SubscribeLanding lang="hr" />
      </main>
      <Footer lang="hr" newsletter={false} />
    </>
  );
}
