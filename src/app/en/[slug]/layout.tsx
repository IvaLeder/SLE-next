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
    getTranslatedPostBySlug("en", slug);

  const switchUrl = translatedPost
    ? `/hr/${translatedPost.slug}`
    : "/hr";

  return (
    <Layout
      lang="en"
      switchUrl={switchUrl}
    >
      {children}
    </Layout>
  );
}