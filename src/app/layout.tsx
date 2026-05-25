import "./globals.css";
import { Lora } from "next/font/google";
import { headers } from "next/headers";
import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "700"],
});

// Single source of truth for absolute URLs (OG images, alternates, etc.)
// Also silences the Next.js metadataBase warning.
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
};

// Drives the mobile browser chrome (address bar) tint.
export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware stamps x-pathname so we can derive the correct lang here.
  // This keeps <html lang> accurate for every language segment without
  // restructuring the route tree.
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const lang = pathname.startsWith("/hr") ? "hr" : "en";

  return (
    <html lang={lang} className={lora.className}>
      <body>{children}</body>
    </html>
  );
}
