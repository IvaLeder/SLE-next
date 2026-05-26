import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | STEM Little Explorers",
  description: "How STEM Little Explorers collects, uses and protects your personal data.",
  // Keep legal pages out of search results — they shouldn't compete with content.
  // `follow` keeps any outbound links discoverable.
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://stemlittleexplorers.com/en/privacy",
    languages: {
      en: "https://stemlittleexplorers.com/en/privacy",
      hr: "https://stemlittleexplorers.com/hr/privacy",
    },
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Header lang="en" switchUrl="/hr/privacy" />
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-10 prose prose-lg">
        <h1>Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: {new Date().getFullYear()}</p>

        <h2>Who we are</h2>
        <p>
          STEM Little Explorers (<strong>stemlittleexplorers.com</strong>) is a blog
          about STEM activities and child development, run by Iva Leder.
        </p>

        <h2>What data we collect</h2>
        <ul>
          <li>
            <strong>Newsletter sign-ups</strong> — email address, collected and stored
            by Mailchimp. See{" "}
            <a href="https://mailchimp.com/legal/privacy/" target="_blank" rel="noreferrer">
              Mailchimp&rsquo;s Privacy Policy
            </a>
            .
          </li>
          <li>
            <strong>Contact form</strong> — name, email address and message content,
            used solely to respond to your enquiry.
          </li>
          <li>
            <strong>Analytics</strong> — we may use privacy-friendly analytics to
            understand which articles are most helpful. No personal data is sold or
            shared with advertisers.
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>
          This site uses cookies set by third-party services (Mailchimp, Google
          reCAPTCHA). By using the site you accept their use. You can disable cookies
          in your browser settings at any time.
        </p>

        <h2>Your rights (GDPR)</h2>
        <p>
          If you are located in the EU/EEA, you have the right to access, correct or
          delete any personal data we hold about you. To exercise these rights, please
          contact us via the{" "}
          <Link href="/en/contact">contact page</Link>.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Use the{" "}
          <Link href="/en/contact">contact form</Link> and we will respond as soon as
          possible.
        </p>
      </main>
      <Footer lang="en" />
    </>
  );
}
