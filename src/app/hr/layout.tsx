import type { Metadata } from "next";

// Issue 13: advertise the HR RSS feed in every HR page's <head>.
export const metadata: Metadata = {
  alternates: {
    types: {
      "application/rss+xml": [
        {
          url: "https://stemlittleexplorers.com/rss-hr.xml",
          title: "STEM Little Explorers – HR",
        },
      ],
    },
  },
};

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
