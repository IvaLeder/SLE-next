"use client";

import Header from "./Header";
import Footer from "./Footer";

export default function Layout({
  lang,
  switchUrl,
  children,
}: {
  lang: "en" | "hr";
  switchUrl: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header
        lang={lang}
        switchUrl={switchUrl}
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>

      <Footer lang={lang} />
    </>
  );
}