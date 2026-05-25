import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  getTranslatedPostBySlug,
} from "@/lib/posts";

export default async function PostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const translatedPost =
    getTranslatedPostBySlug("hr", slug);

  const switchUrl = translatedPost
    ? `/en/${translatedPost.slug}`
    : "/en";

  return (
    <>
      <Header
        lang="hr"
        switchUrl={switchUrl}
      />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      <Footer lang="hr" />
    </>
  );
}