import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrintablesHub from "@/components/PrintablesHub";
import { siteConfig } from "@/config/site";
import { PRINTABLES_SLUG } from "@/lib/printables";

const url = `${siteConfig.url}/en/${PRINTABLES_SLUG.en}`;
const hrUrl = `${siteConfig.url}/hr/${PRINTABLES_SLUG.hr}`;

export const metadata: Metadata = {
  title: "Free STEM Printables & Worksheets for Kids | STEM Little Explorers",
  description:
    "Free printable STEM worksheets, lab sheets, cut-out templates and observation journals for kids. Download the PDF and print at home or in class. No sign-up.",
  alternates: {
    canonical: url,
    languages: { en: url, hr: hrUrl, "x-default": url },
  },
  openGraph: {
    title: "Free STEM printables for kids",
    description:
      "Worksheets, lab sheets, cut-out templates and observation journals that go with our hands-on activities. Free PDFs, no sign-up.",
    url,
    type: "website",
  },
};

export default function PrintablesPage() {
  return (
    <>
      <Header lang="en" switchUrl={`/hr/${PRINTABLES_SLUG.hr}`} />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <PrintablesHub lang="en" />
      </main>
      <Footer lang="en" newsletter={false} />
    </>
  );
}
