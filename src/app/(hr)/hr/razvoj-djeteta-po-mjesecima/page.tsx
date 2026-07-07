import { Metadata } from "next";
import MilestoneGuide from "@/components/MilestoneGuide";
import { MILESTONE_GUIDE_SLUG, milestoneGuideCopy } from "@/lib/milestone-guide";
import { siteConfig } from "@/config/site";

const url = `${siteConfig.url}/hr/${MILESTONE_GUIDE_SLUG.hr}`;

export const metadata: Metadata = {
  title: `${milestoneGuideCopy.hr.title} | STEM Little Explorers`,
  description: milestoneGuideCopy.hr.description,
  alternates: {
    canonical: url,
    languages: {
      en: `${siteConfig.url}/en/${MILESTONE_GUIDE_SLUG.en}`,
      hr: url,
    },
  },
  openGraph: {
    title: milestoneGuideCopy.hr.h1,
    description: milestoneGuideCopy.hr.description,
    url,
    type: "website",
  },
};

export default function Page() {
  return <MilestoneGuide lang="hr" />;
}
