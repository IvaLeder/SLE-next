import type { Metadata } from "next";
import NotFoundPage from "@/components/NotFoundPage";

// Static export writes one generic 404.html, so the HR "not found" page is
// rendered here at /hr/404. worker/index.ts serves it, with a 404 status, for
// every unknown /hr/… URL. Not in the sitemap; noindex like any 404.
export const metadata: Metadata = {
  title: "Stranica nije pronađena",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <NotFoundPage lang="hr" />;
}
