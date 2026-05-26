export const siteConfig = {
  name: "STEM Little Explorers",
  url: "https://stemlittleexplorers.com",
  author: {
    name: "Iva Leder",
    url: "https://stemlittleexplorers.com/about",
  },
  description:
    "Hands-on STEM activities, psychology insights, and educational resources for curious kids and parents.",
  locale: "en",
  languages: ["en", "hr"],
  // TODO: replace placeholder URLs once social profiles are live.
  // Leaving as "#" hides the link in the Footer (see Footer.tsx).
  social: {
    facebook:  "#",
    instagram: "#",
    pinterest: "#",
    youtube:   "#",
  },
} as const;
