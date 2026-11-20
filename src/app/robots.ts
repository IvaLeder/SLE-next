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
      // GoogleOther is Google's generic research crawler. It plays no part in
      // Search ranking or indexing, but it was ~4% of the site's billed Vercel
      // CDN requests (Nov 2026). Googlebot, Googlebot-Image and
      // Mediapartners-Google (AdSense) match only the "*" group above, so
      // they are unaffected.
      {
        userAgent: ["GoogleOther", "GoogleOther-Image", "GoogleOther-Video"],
        disallow: "/",
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}