import { ImageResponse } from "next/og";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { CATEGORY_DISPLAY, categorySlugFromName } from "@/lib/categories";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "STEM Little Explorers";

// Pre-render an OG image per article at build time (one PNG per slug).
export function generateStaticParams() {
  return getAllPosts("hr").map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getPostBySlug("hr", params.slug);
  if (!post) return new Response("Not found", { status: 404 });

  const isActivity   = post.tags?.includes("activity") ?? false;
  const categoryName = post.categories?.[0] ?? null;
  const categorySlug = categoryName ? categorySlugFromName(categoryName) : null;
  const categoryLabel = categorySlug ? CATEGORY_DISPLAY.hr[categorySlug] : categoryName;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", fontSize: 28, opacity: 0.85, letterSpacing: 3, textTransform: "uppercase" }}>
            STEM Little Explorers
          </div>
          {categoryLabel && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 24px",
                background: "rgba(255,255,255,0.18)",
                borderRadius: 999,
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              {isActivity && <span>⚡</span>}
              <span>{categoryLabel}</span>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            maxWidth: "100%",
          }}
        >
          {post.title}
        </div>

        <div style={{ display: "flex", fontSize: 24, opacity: 0.75 }}>
          stemlittleexplorers.com
        </div>
      </div>
    ),
    { ...size }
  );
}
