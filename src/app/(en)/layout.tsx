// Root layout for ENGLISH routes (route group `(en)`).
// This is one of TWO root layouts — see app/(hr)/layout.tsx for the Croatian one.
// Each is fully static because the `lang` attribute is known at compile time.
import "../globals.css";
import { Lora, Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Lora drives body copy + article prose + page titles (editorial feel).
// Italic is now included so MDX *italics* render with a real italic face
// instead of synthesized slant.
const lora = Lora({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

// Inter drives UI chrome (Header, Footer, buttons, filter chips, form inputs).
// Same subsets as Lora so Croatian glyphs render correctly.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
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
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <body>
        {/* Keyboard-first skip link — visible only when focused */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
        >
          Skip to content
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
