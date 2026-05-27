import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

// Next.js metadata route: served as `/robots.txt` at the root.
// Must live inside an app directory (route group is fine, like sitemap.tsx).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}