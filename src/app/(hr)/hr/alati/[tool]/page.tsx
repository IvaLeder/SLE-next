import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolPage from "@/components/tools/ToolPage";
import AdSenseScript from "@/components/AdSenseScript";
import AdSlot from "@/components/AdSlot";
import { AD_SLOTS } from "@/lib/ads";
import { tools, toolBySlug } from "@/lib/tools";
import { Metadata } from "next";
import { generateToolMetadata } from "@/lib/tool-metadata";
import MindsTheme from "@/components/minds/MindsTheme";

type Props = { params: Promise<{ tool: string }> };

export function generateStaticParams() {
  return tools.map((t) => ({ tool: t.slug.hr }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  const data = toolBySlug("hr", tool);
  if (!data) return {};
  return generateToolMetadata(data, "hr");
}

export default async function ToolDetailPage({ params }: Props) {
  const { tool } = await params;
  const data = toolBySlug("hr", tool);
  if (!data) return notFound();

  const page = (
    <>
      <AdSenseScript />
      <Header lang="hr" switchUrl={`/en/tools/${data.slug.en}`} />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
        <ToolPage lang="hr" tool={data} />
        {/* Renders nothing until NEXT_PUBLIC_ADSENSE_SLOT_TOOLS is set. */}
        <AdSlot slot={AD_SLOTS.tools} lang="hr" format="display" />
      </main>
      <Footer lang="hr" />
    </>
  );

  return data.key === "developmental-leaps" ? <MindsTheme>{page}</MindsTheme> : page;
}
