/**
 * Registry for the interactive `/tools` (HR `/alati`) section. One entry per
 * tool, browser-safe (no component imports) so pages, the hub and the sitemap
 * can all read it. The interactive UI for each tool is mapped by `key` in
 * `src/components/tools/ToolPage.tsx`.
 */
export type Lang = "en" | "hr";
type L = Record<Lang, string>;

export const TOOLS_SLUG: Record<Lang, string> = { en: "tools", hr: "alati" };

export interface ToolMaterial {
  name: L;
  q: L;
}

export interface Tool {
  /** Stable id; maps to the interactive component in ToolPage. */
  key: string;
  /** Per-language URL slug under /{lang}/{TOOLS_SLUG}. */
  slug: Record<Lang, string>;
  icon: string;
  title: L;
  /** One-line hook (hub card + page lead). */
  tagline: L;
  /** SEO meta description. */
  description: L;
  /** Optional cross-link to the article the tool extends. */
  related?: { slug: Record<Lang, string>; label: L };
  /** Optional affiliate "you'll need" items shown on the tool page. */
  materials?: ToolMaterial[];
}

export const tools: Tool[] = [
  /* {
    key: "name-in-binary",
    slug: { en: "name-in-binary", hr: "ime-u-binarnom-kodu" },
    icon: "💻",
    title: {
      en: "Name in binary generator",
      hr: "Generator imena u binarnom kodu",
    },
    tagline: {
      en: "Type any name and watch it turn into binary code — then make it into a colorful bead bracelet.",
      hr: "Upišite bilo koje ime i gledajte kako se pretvara u binarni kod — pa ga izradite kao šarenu narukvicu od perli.",
    },
    description: {
      en: "A free, kid-friendly binary translator: type any name to see it in 1s and 0s, then string it as a bead bracelet. Handles Croatian accented letters too.",
      hr: "Besplatni binarni prevoditelj za djecu: upišite ime i vidite ga u nulama i jedinicama, pa ga izradite kao narukvicu od perli. Radi i s hrvatskim slovima s kvačicama.",
    },
    related: {
      slug: {
        en: "write-your-name-in-binary",
        hr: "napisi-svoje-ime-binarnim-kodom",
      },
      label: { en: "Read the full activity", hr: "Pročitajte cijelu aktivnost" },
    },
    materials: [
      {
        name: { en: "Pony beads in two colors", hr: "Perle za nakit u dvije boje" },
        q: { en: "pony beads bulk", hr: "pony perle za nakit" },
      },
      {
        name: { en: "Pipe cleaners", hr: "Žica za savijanje (pipe cleaners)" },
        q: { en: "pipe cleaners craft", hr: "žica za savijanje pipe cleaners" },
      },
      {
        name: { en: "String or cord", hr: "Uzica ili vrpca" },
        q: { en: "craft cord string", hr: "uzica za nakit" },
      },
    ],
  }, */
  {
    key: "caesar-cipher",
    slug: { en: "caesar-cipher", hr: "cezarova-sifra" },
    icon: "🔐",
    title: {
      en: "Caesar cipher maker",
      hr: "Cezarova šifra",
    },
    tagline: {
      en: "Scramble a message by shifting the alphabet and then dare a friend to crack it.",
      hr: "Šifrirajte poruku pomicanjem abecede pa izazovite prijatelja da je razbije.",
    },
    description: {
      en: "Free Caesar cipher encoder and decoder. Type a message, pick a shift, and turn it into a secret code. A kid-friendly intro to cryptography.",
      hr: "Besplatni alat za Cezarovu šifru. Upišite poruku, odaberite pomak i pretvorite je u tajni kod. Zabavan uvod u kriptografiju za djecu.",
    },
    related: {
      slug: {
        en: "how-to-make-cipher-wheel",
        hr: "kako-napraviti-kotac-za-sifriranje",
      },
      label: { en: "Make a physical cipher wheel", hr: "Napravite fizički kotač za šifriranje" },
    },
    materials: [
      {
        name: { en: "Cardstock or thick paper", hr: "Tvrđi papir (hamer papir)" },
        q: { en: "cardstock paper", hr: "hamer papir" },
      },
      {
        name: { en: "Split pins (brads)", hr: "Pribadače" },
        q: { en: "split pins brads", hr: "pribadače" },
      },
      {
        name: { en: "Scissors", hr: "Škare" },
        q: { en: "scissors craft kids", hr: "škare za djecu" },
      },
    ],
  },
];

export function toolBySlug(lang: Lang, slug: string): Tool | undefined {
  return tools.find((t) => t.slug[lang] === slug);
}
