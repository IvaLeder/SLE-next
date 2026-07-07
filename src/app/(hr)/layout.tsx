// Root layout for CROATIAN routes (route group `(hr)`).
// Counterpart to app/(en)/layout.tsx. Each language gets its own static root.
import "../globals.css";
import { Lora, Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GtmWithConsent from "@/components/GtmWithConsent";

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

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

// Pinterest domain claim — same p:domain_verify tag as the EN root layout, so
// the meta renders on HR pages too (Pinterest only needs to see it once).
const pinterestVerify = process.env.PINTEREST_DOMAIN_VERIFY;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...(pinterestVerify ? { verification: { other: { "p:domain_verify": pinterestVerify } } } : {}),
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
    <html lang="hr" className={`${lora.variable} ${inter.variable}`}>
      <body>
        {/* Keyboard-first skip link — visible only when focused */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
        >
          Preskoči na sadržaj
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
