import Layout from "@/components/Layout";
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
    <Layout
      lang="hr"
      switchUrl={switchUrl}
    >
      {children}
    </Layout>
  );
}