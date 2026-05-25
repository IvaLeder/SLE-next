// Root layout for ENGLISH routes (route group `(en)`).
// This is one of TWO root layouts — see app/(hr)/layout.tsx for the Croatian one.
// Each is fully static because the `lang` attribute is known at compile time.
import "../globals.css";
import { Lora } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  alternates: {
    types: {
      "application/rss+xml": [
        {
          url: `${siteConfig.url}/rss-en.xml`,
          title: "STEM Little Explorers – EN",
        },
      ],
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function EnRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lora.className}>
      <body>{children}</body>
    </html>
  );
}
