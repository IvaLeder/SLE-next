import { Metadata } from "next";
import MilestoneGuide from "@/components/MilestoneGuide";
import { MILESTONE_GUIDE_SLUG, milestoneGuideCopy } from "@/lib/milestone-guide";
import { siteConfig } from "@/config/site";

const url = `${siteConfig.url}/en/${MILESTONE_GUIDE_SLUG.en}`;

export const metadata: Metadata = {
  title: `${milestoneGuideCopy.en.title} | STEM Little Explorers`,
  description: milestoneGuideCopy.en.description,
  alternates: {
    canonical: url,
    languages: {
      en: url,
      hr: `${siteConfig.url}/hr/${MILESTONE_GUIDE_SLUG.hr}`,
    },
  },
  openGraph: {
    title: milestoneGuideCopy.en.h1,
    description: milestoneGuideCopy.en.description,
    url,
    type: "website",
  },
};

export default function Page() {
  return <MilestoneGuide lang="en" />;
}
