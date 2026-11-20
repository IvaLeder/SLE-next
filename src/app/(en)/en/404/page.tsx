import type { Metadata } from "next";
import NotFoundPage from "@/components/NotFoundPage";

// Static export writes one generic 404.html, so the EN "not found" page is
// rendered here at /en/404. worker/index.ts serves it, with a 404 status, for
// every unknown /en/… URL. Not in the sitemap; noindex like any 404.
export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <NotFoundPage lang="en" />;
}
