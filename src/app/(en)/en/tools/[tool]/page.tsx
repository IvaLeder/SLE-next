import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolPage from "@/components/tools/ToolPage";
import AdSenseScript from "@/components/AdSenseScript";
import AdSlot from "@/components/AdSlot";
import { AD_SLOTS } from "@/lib/ads";
import { tools, toolBySlug } from "@/lib/tools";
import { Metadata } from "next";

type Props = { params: Promise<{ tool: string }> };

export function generateStaticParams() {
  return tools.map((t) => ({ tool: t.slug.en }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  const data = toolBySlug("en", tool);
  if (!data) return {};
  return {
    title: `${data.title.en} | STEM Little Explorers`,
    description: data.description.en,
    alternates: {
      canonical: `https://stemlittleexplorers.com/en/tools/${data.slug.en}`,
      languages: {
        en: `https://stemlittleexplorers.com/en/tools/${data.slug.en}`,
        hr: `https://stemlittleexplorers.com/hr/alati/${data.slug.hr}`,
      },
    },
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { tool } = await params;
  const data = toolBySlug("en", tool);
  if (!data) return notFound();

  return (
    <>
      <AdSenseScript />
      <Header lang="en" switchUrl={`/hr/alati/${data.slug.hr}`} />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <ToolPage lang="en" tool={data} />
        {/* Renders nothing until NEXT_PUBLIC_ADSENSE_SLOT_TOOLS is set. */}
        <AdSlot slot={AD_SLOTS.tools} lang="en" format="display" />
      </main>
      <Footer lang="en" />
    </>
  );
}
