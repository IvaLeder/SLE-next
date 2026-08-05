import type { Metadata } from "next";

export const siteConfig = {
  name: "STEM Little Explorers",
  url: "https://stemlittleexplorers.com",
  author: {
    name: "Iva Leder",
    url: "https://stemlittleexplorers.com/about",
  },
  description:
    "Hands-on STEM experiments, child development guides, and practical psychology insights for curious kids, parents, and educators.",
  locale: "en",
  languages: ["en", "hr"],

  social: {
    facebook:  "https://www.facebook.com/stemlittleexplorers",
    instagram: "https://www.instagram.com/stem.littleexplorers/",
    pinterest: "https://www.pinterest.com/STEM_Little_Explorers/",
    youtube:   "https://www.youtube.com/@STEMLittleExplorers",
    tiktok:    "https://www.tiktok.com/@stem.little.explorers",
  },
} as const;

// Let search engines use the full text, large images, and available video when
// composing search-result previews. Individual utility/private pages can still
// override this at page level with `robots: { index: false, ... }`.
export const searchPreviewRobots = {
  index: true,
  follow: true,
  "max-snippet": -1,
  "max-image-preview": "large",
  "max-video-preview": -1,
  googleBot: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
} satisfies Metadata["robots"];
