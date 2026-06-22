import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolPage from "@/components/tools/ToolPage";
import { tools, toolBySlug } from "@/lib/tools";
import { Metadata } from "next";

type Props = { params: Promise<{ tool: string }> };

export function generateStaticParams() {
  return tools.map((t) => ({ tool: t.slug.hr }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  const data = toolBySlug("hr", tool);
  if (!data) return {};
  return {
    title: `${data.title.hr} | STEM Little Explorers`,
    description: data.description.hr,
    alternates: {
      canonical: `https://stemlittleexplorers.com/hr/alati/${data.slug.hr}`,
      languages: {
        en: `https://stemlittleexplorers.com/en/tools/${data.slug.en}`,
        hr: `https://stemlittleexplorers.com/hr/alati/${data.slug.hr}`,
      },
    },
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { tool } = await params;
  const data = toolBySlug("hr", tool);
  if (!data) return notFound();

  return (
    <>
      <Header lang="hr" switchUrl={`/en/tools/${data.slug.en}`} />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <ToolPage lang="hr" tool={data} />
      </main>
      <Footer lang="hr" />
    </>
  );
}
