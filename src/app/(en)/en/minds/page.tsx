import { Metadata } from "next";
import MindsHub from "@/components/minds/MindsHub";
import { MINDS_SLUG, mindsCopy } from "@/lib/minds";
import { siteConfig } from "@/config/site";

const url = `${siteConfig.url}/en/${MINDS_SLUG.en}`;

export const metadata: Metadata = {
  title: mindsCopy.en.title,
  description: mindsCopy.en.description,
  alternates: {
    canonical: url,
    languages: {
      en: url,
      hr: `${siteConfig.url}/hr/${MINDS_SLUG.hr}`,
    },
  },
  openGraph: {
    title: `${mindsCopy.en.h1}: ${mindsCopy.en.tagline}`,
    description: mindsCopy.en.description,
    url,
    type: "website",
  },
};

export default function Page() {
  return <MindsHub lang="en" />;
}
