import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubscribeLanding from "@/components/SubscribeLanding";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscribe to the newsletter | STEM Little Explorers",
  description:
    "Get new hands-on STEM experiments, Mind Explorers articles on child psychology, and free printables in your inbox, about once or twice a month.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/en/subscribe",
    languages: {
      en: "https://stemlittleexplorers.com/en/subscribe",
      hr: "https://stemlittleexplorers.com/hr/pretplata",
    },
  },
};

export default function SubscribePage() {
  return (
    <>
      <Header lang="en" switchUrl="/hr/pretplata" />
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-10">
        <SubscribeLanding lang="en" />
      </main>
      <Footer lang="en" newsletter={false} />
    </>
  );
}
