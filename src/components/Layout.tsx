"use client"

import Header from "./Header";
import Footer from "./Footer";

export default function Layout({
  lang,
  children,
}: {
  lang: "en" | "hr";
  children: React.ReactNode;
}) {
  return (
    <>
      <Header lang={lang} />

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

      <Footer lang={lang} />
    </>
  );
}