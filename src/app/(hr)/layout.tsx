// Root layout for CROATIAN routes (route group `(hr)`).
// Counterpart to app/(en)/layout.tsx. Each language gets its own static root.
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
          url: `${siteConfig.url}/rss-hr.xml`,
          title: "STEM Little Explorers – HR",
        },
      ],
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function HrRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr" className={lora.className}>
      <body>{children}</body>
    </html>
  );
}
