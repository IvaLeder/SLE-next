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
  /** Optional printable PDF companion (path under /public), shown as a download card. */
  download?: { href: Record<Lang, string>; title: L; pages: number; size: Record<Lang, string> };
}

export const tools: Tool[] = [
{
    key: "name-in-binary",
    slug: { en: "name-in-binary", hr: "ime-u-binarnom-kodu" },
    icon: "💻",
    title: {
      en: "Name in binary generator",
      hr: "Generator imena u binarnom kodu",
    },
    tagline: {
      en: "Type any name and watch it turn into binary code and then make it into a colorful bead bracelet.",
      hr: "Upišite bilo koje ime i gledajte kako se pretvara u binarni kod pa ga izradite kao šarenu narukvicu od perli.",
    },
    description: {
      en: "A free, kid-friendly binary translator: type any name to see it in 1s and 0s, then string it as a bead bracelet. Handles Croatian accented letters too.",
      hr: "Besplatni binarni prevoditelj za djecu: upišite ime i vidite ga u nulama i jedinicama, pa ga izradite kao narukvicu od perli.",
    },
    related: {
      slug: {
        en: "write-your-name-in-binary",
        hr: "napisi-svoje-ime-binarnim-kodom",
      },
      label: { en: "Read the full activity", hr: "Pročitajte cijelu aktivnost" },
    },
  },
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
    download: {
      href: {
        en: "/downloads/cipher-wheel-template.pdf",
        hr: "/downloads/kotac-za-sifriranje-predlozak.pdf",
      },
      title: { en: "Cipher wheel template", hr: "Predložak kotača za šifriranje" },
      pages: 2,
      size: { en: "138 KB", hr: "148 KB" },
    },
  },
  {
    key: "tower-of-hanoi",
    slug: { en: "tower-of-hanoi", hr: "hanojski-toranj" },
    icon: "🗼",
    title: {
      en: "Tower of Hanoi",
      hr: "Hanojski toranj",
    },
    tagline: {
      en: "Move the whole stack to the last peg in as few moves as you can. Test yourself in this classic puzzle of logic and patience.",
      hr: "Premjestite cijeli toranj na zadnji štap u što manje poteza. Iskušajte se u ovom klasičnom treningu logike i strpljenja.",
    },
    description: {
      en: "Play the Tower of Hanoi puzzle online: move the disk stack to the last peg without ever putting a bigger disk on a smaller one. A fun logic puzzle for kids.",
      hr: "Igrajte zagonetku Hanojski toranj online: premjestite toranj diskova na zadnji štap, a da veći disk nikad ne stavite na manji. Zabavna logička zagonetka za djecu.",
    },
    related: {
      slug: {
        en: "make-and-solve-tower-of-hanoi",
        hr: "kako-napraviti-rijesiti-hanoi-toranj",
      },
      label: { en: "Build your own & learn the math", hr: "Napravite svoj i naučite matematiku" },
    },
  },
  {
    key: "activity-spinner",
    slug: { en: "activity-spinner", hr: "kotac-aktivnosti" },
    icon: "🎲",
    title: {
      en: "Activity spinner",
      hr: "Kotač aktivnosti",
    },
    tagline: {
      en: "Can't decide what to do? Give it a spin and let chance pick your next hands-on STEM activity.",
      hr: "Ne možete se odlučiti? Zavrtite i vidite što će biti vaša sljedeća praktična STEM aktivnost.",
    },
    description: {
      en: "Can't decide what to make? Spin the wheel for a random hands-on STEM activity for kids - experiments, crafts and more.",
      hr: "Ne znate što biste? Zavrtite kotač za nasumičnu praktičnu STEM aktivnost za djecu - pokuse, radove i još mnogo toga.",
    },
    related: {
      slug: { en: "activities", hr: "activities" },
      label: { en: "Browse all activities", hr: "Pregledajte sve aktivnosti" },
    },
  },
  {
    key: "fraction-visualizer",
    slug: { en: "fraction-visualizer", hr: "vizualizator-razlomaka" },
    icon: "🍕",
    title: {
      en: "Fraction visualizer",
      hr: "Vizualizator razlomaka",
    },
    tagline: {
      en: "See any fraction as a pie and a bar and watch it turn into a percentage and a decimal.",
      hr: "Vizualizirajte svaki razlomak kao pitu (kružni model) i kao traku (pravokutni model). Možete pratiti kako postaje postotak i decimalni broj.",
    },
    description: {
      en: "A free fraction visualizer for kids: pick a numerator and denominator and see the fraction as a pie chart and bar, plus its percentage, decimal and simplest form.",
      hr: "Besplatni vizualizator razlomaka za djecu: odaberite brojnik i nazivnik i vidite razlomak kao pitu i traku, uz postotak, decimalni broj i najjednostavniji oblik.",
    },
    related: {
      slug: {
        en: "how-to-learn-fractions-fun-easy-way",
        hr: "kako-nauciti-razlomke-na-lak-nacin",
      },
      label: { en: "The full fractions activity", hr: "Cijela aktivnost o razlomcima" },
    },
  },
  {
    key: "find-birthday-in-pi",
    slug: { en: "find-your-birthday-in-pi", hr: "pronadi-rodendan-u-piju" },
    icon: "🎂",
    title: {
      en: "Find your birthday in Pi",
      hr: "Pronađi svoj rođendan u broju π",
    },
    tagline: {
      en: "Type your birthday and discover exactly where those digits appear in the never-ending number π.",
      hr: "Upišite svoj rođendan i otkrijte gdje se točno te znamenke pojavljuju u beskonačnom broju π.",
    },
    description: {
      en: "A free tool that searches a million digits of Pi for your birthday — or any number — and shows exactly where it hides in π. A fun way to explore an irrational number.",
      hr: "Besplatni alat koji pretražuje milijun znamenki broja Pi i traži vaš rođendan — ili bilo koji broj — te pokazuje gdje se točno krije u π. Zabavan način istraživanja iracionalnog broja.",
    },
    related: {
      slug: {
        en: "explore-number-pi",
        hr: "istrazimo-broj-pi",
      },
      label: { en: "Read all about the number Pi", hr: "Pročitajte sve o broju Pi" },
    },
  },
  {
    key: "clock",
    slug: { en: "learn-to-tell-time", hr: "uci-citati-sat" },
    icon: "🕐",
    title: {
      en: "Learn to tell the time",
      hr: "Nauči koristiti analogni sat",
    },
    tagline: {
      en: "Drag the hands of an interactive clock and watch it read the time back to you — a playful way to learn to tell time on an analog clock.",
      hr: "Povucite kazaljke interaktivnog sata i reći će vam koje je vrijeme, jednostavan i zabavan način za učenje čitanja analognog sata.",
    },
    description: {
      en: "A free interactive analog clock for kids: drag the hour and minute hands to set any time and see it read out in words and digits, with a practice mode for telling time.",
      hr: "Besplatni interaktivni analogni sat za djecu: povlačite satnu i minutnu kazaljku, postavite vrijeme i pročitajte ga riječima i brojkama, uz dodatnu opciju za vježbu.",
    },
    related: {
      slug: {
        en: "make-cardboard-clock-learn-tell-time",
        hr: "kako-napraviti-sat-od-kartona-pomocu-njega-uciti-na-sat",
      },
      label: {
        en: "Make your own cardboard clock",
        hr: "Napravite vlastiti sat od kartona",
      },
    },
  },
  {
    key: "morse-code",
    slug: { en: "morse-code-translator", hr: "morseova-abeceda" },
    icon: "📡",
    title: {
      en: "Morse code translator",
      hr: "Morseova abeceda",
    },
    tagline: {
      en: "Turn any message into dots and dashes! Press play to hear it beep out loud and flash, just like a real telegraph.",
      hr: "Pretvorite poruku u točkice i crtice! Pritisnite play da je čujete kako pišti i bljeska, baš kao pravi telegraf.",
    },
    description: {
      en: "A free Morse code translator for kids: type a message to see it in dots and dashes, play it as sound and light, or decode Morse back into text.",
      hr: "Besplatni prevoditelj Morseove abecede za djecu: upišite poruku i vidite je u točkicama i crticama, odsvirajte je kao zvuk i svjetlo ili dešifrirajte Morse natrag u tekst.",
    },
  },
  {
    key: "developmental-leaps",
    slug: { en: "developmental-leap-calculator", hr: "kalkulator-skokova-u-razvoju" },
    icon: "👶",
    title: {
      en: "Developmental leap calculator",
      hr: "Kalkulator skokova u razvoju",
    },
    tagline: {
      en: "Enter your baby's due date and get a personal calendar of all 10 developmental leaps, with what to expect from each one.",
      hr: "Upišite termin poroda i dobit ćete osobni kalendar svih 10 skokova u razvoju, uz kratki opis što očekivati od svakoga.",
    },
    description: {
      en: "Free developmental leap calculator: enter your baby's due date to see the dates of all 10 mental leaps in the first 20 months, which leap is happening now and what to expect.",
      hr: "Besplatni kalkulator skokova u razvoju: upišite termin poroda i saznajte datume svih 10 skokova u prvih 20 mjeseci, koji je skok u tijeku i što očekivati.",
    },
    related: {
      slug: { en: "tag/milestone", hr: "tag/milestone" },
      label: {
        en: "Month-by-month milestone guides",
        hr: "Vodiči kroz razvoj mjesec po mjesec",
      },
    },
  },
];

export function toolBySlug(lang: Lang, slug: string): Tool | undefined {
  return tools.find((t) => t.slug[lang] === slug);
}
