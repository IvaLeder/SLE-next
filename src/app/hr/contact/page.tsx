import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <>
      <Header lang="hr" switchUrl="/en/contact" />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <ContactForm lang="hr" />
      </main>
      <Footer lang="hr" />
    </>
  );
}