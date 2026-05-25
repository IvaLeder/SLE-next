import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | STEM Little Explorers",
  description: "Terms and conditions for using the STEM Little Explorers website.",
  alternates: {
    canonical: "https://stemlittleexplorers.com/en/terms",
    languages: {
      en: "https://stemlittleexplorers.com/en/terms",
      hr: "https://stemlittleexplorers.com/hr/terms",
    },
  },
};

export default function TermsPage() {
  return (
    <>
      <Header lang="en" switchUrl="/hr/terms" />
      <main className="max-w-3xl mx-auto px-4 py-10 prose prose-lg">
        <h1>Terms of Use</h1>
        <p className="text-gray-500 text-sm">Last updated: {new Date().getFullYear()}</p>

        <h2>Acceptance of terms</h2>
        <p>
          By accessing or using <strong>stemlittleexplorers.com</strong> you agree to
          these Terms of Use. If you do not agree, please do not use the site.
        </p>

        <h2>Content</h2>
        <p>
          All articles, activities and resources on this site are provided for
          informational and educational purposes only. They are not a substitute for
          professional medical, psychological or educational advice. Always consult a
          qualified professional for concerns about your child's health or development.
        </p>

        <h2>Intellectual property</h2>
        <p>
          All original content on this site — text, images and videos — is the property
          of STEM Little Explorers unless otherwise stated. You may share our content
          with proper attribution and a link back to the original article. Republishing
          full articles without permission is not allowed.
        </p>

        <h2>External links</h2>
        <p>
          This site may contain links to third-party websites. We are not responsible
          for the content or privacy practices of those sites.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          STEM Little Explorers is not liable for any damages arising from the use of
          information or activities described on this site. All activities involving
          children should be supervised by a responsible adult.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We reserve the right to update these terms at any time. Continued use of the
          site after changes are posted constitutes acceptance of the new terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions? Reach us via the{" "}
          <a href="/en/contact">contact page</a>.
        </p>
      </main>
      <Footer lang="en" />
    </>
  );
}
