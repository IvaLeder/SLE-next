// Root layout for ENGLISH routes (route group `(en)`).
// This is one of TWO root layouts — see app/(hr)/layout.tsx for the Croatian one.
// Each is fully static because the `lang` attribute is known at compile time.
import "../globals.css";
import { Lora, Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GtmWithConsent from "@/components/GtmWithConsent";

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
// preload:false — Inter is UI chrome (nav, buttons, meta), never the LCP
// element. Preloading its weights put several render-blocking font requests on
// the critical path, competing with CSS and delaying the (text) LCP. With
// display:swap the chrome still renders immediately in the adjusted fallback and
// swaps to Inter once it loads off the critical path. Lora stays preloaded — it
// paints the hero <h1>, the measured LCP element.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  preload: false,
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
        {/* GTM + Consent Mode v2 regional defaults — no-ops when NEXT_PUBLIC_GTM_ID is unset.
            The visible consent prompt is Google's CMP (AdSense Privacy & messaging). */}
        <GtmWithConsent />
      </body>
    </html>
  );
}
