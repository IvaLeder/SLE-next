import { tools, toolBySlug } from "@/lib/tools";
import { renderToolOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/tool-og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "STEM Little Explorers: interaktivni alat";

export function generateStaticParams() {
  return tools.map((t) => ({ tool: t.slug.hr }));
}

export default async function Image({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const data = toolBySlug("hr", tool);
  if (!data) return new Response("Not found", { status: 404 });
  return renderToolOg(data, "hr");
}
