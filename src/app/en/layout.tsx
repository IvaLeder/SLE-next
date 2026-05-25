import type { Metadata } from "next";

// Issue 13: advertise the EN RSS feed in every EN page's <head>
// so feed readers and Google Discover can discover it automatically.
export const metadata: Metadata = {
  alternates: {
    types: {
      "application/rss+xml": [
        {
          url: "https://stemlittleexplorers.com/rss-en.xml",
          title: "STEM Little Explorers – EN",
        },
      ],
    },
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
