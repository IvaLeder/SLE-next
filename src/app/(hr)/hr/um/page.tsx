import { Metadata } from "next";
import MindsHub from "@/components/minds/MindsHub";
import { MINDS_SLUG, mindsCopy } from "@/lib/minds";
import { siteConfig } from "@/config/site";

const url = `${siteConfig.url}/hr/${MINDS_SLUG.hr}`;

export const metadata: Metadata = {
  title: mindsCopy.hr.title,
  description: mindsCopy.hr.description,
  alternates: {
    canonical: url,
    languages: {
      en: `${siteConfig.url}/en/${MINDS_SLUG.en}`,
      hr: url,
    },
  },
  openGraph: {
    title: `${mindsCopy.hr.h1}: ${mindsCopy.hr.tagline}`,
    description: mindsCopy.hr.description,
    url,
    type: "website",
  },
};

export default function Page() {
  return <MindsHub lang="hr" />;
}
