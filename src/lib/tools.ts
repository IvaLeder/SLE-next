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
  /** Draft tools stay available to developers without entering public routes,
   *  the hub, or the sitemap. Omit for public tools. */
  status?: "draft";
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
  /** Optional printable PDF companion (path under /public), shown as a download card.
   *  `id` is the GTM tracking handle; it must match the id on the same printable's
   *  <Printable> in the related article, so both surfaces report as one download. */
  download?: {
    id: string;
    href: Record<Lang, string>;
    title: L;
    pages: number;
    size: Record<Lang, string>;
  };
}

const allTools: Tool[] = [
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
      id: "cipher-wheel",
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
      hr: "Igrajte Hanojski toranj online: premjestite sve diskove na zadnji štap bez stavljanja većeg diska na manji. Logička igra za djecu.",
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
      en: "Can't decide what to make? Spin for a random hands-on STEM activity for kids — experiments, crafts and more. Start exploring with one click.",
      hr: "Ne znate što biste? Zavrtite kotač za nasumičnu praktičnu STEM aktivnost za djecu — pokus, projekt ili kreativni rad — i odmah otvorite vodič.",
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
      en: "Free fraction visualizer for kids: choose a numerator and denominator, then compare the fraction as a pie, bar, percentage, decimal and simplest form.",
      hr: "Besplatni vizualizator razlomaka za djecu: odaberite brojnik i nazivnik pa usporedite pitu, traku, postotak, decimalni zapis i skraćeni razlomak.",
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
    key: "multiplication-visualizer",
    slug: {
      en: "multiplication-visualizer",
      hr: "vizualizator-mnozenja",
    },
    icon: "✖️",
    title: {
      en: "Multiplication visualizer",
      hr: "Vizualizator množenja",
    },
    tagline: {
      en: "Build, flip and split multiplication facts, then practise the small set that still needs attention.",
      hr: "Izgradite, okrenite i rastavite činjenice množenja, a zatim vježbajte mali skup koji još traži pažnju.",
    },
    description: {
      en: "A free multiplication visualizer for kids with arrays, equal groups, number-line jumps, break-apart strategies, a times table and focused practice.",
      hr: "Besplatan vizualizator množenja za djecu s poljima, jednakim skupinama, brojevnom crtom, rastavljanjem, tablicom i ciljanom vježbom.",
    },
    related: {
      slug: {
        en: "how-to-learn-multiplication-tables",
        hr: "kako-nauciti-tablicu-mnozenja",
      },
      label: {
        en: "Learn all 12 multiplication strategies",
        hr: "Naučite svih 12 strategija množenja",
      },
    },
  },
  {
    key: "pattern-maker",
    slug: { en: "pattern-maker", hr: "slagalica-uzoraka" },
    icon: "🧩",
    title: {
      en: "Pattern maker",
      hr: "Napravi niz",
    },
    tagline: {
      en: "Pick shapes, colors, letters or pictures, complete the repeating pattern, then print a worksheet to continue by hand.",
      hr: "Odaberite oblike, boje, slova ili sličice i dovršite uzorak koji se ponavlja. Ispišite radni list za zabavu bez ekrana.",
    },
    description: {
      en: "Free pattern maker for kids: complete sequences with shapes, colors, letters, numbers or pictures, build your own and print a practice worksheet.",
      hr: "Besplatni kreator nizova za djecu: dovršite uzorke s oblicima, bojama, slovima, brojevima ili sličicama, složite vlastiti i ispišite radni list.",
    },
    related: {
      slug: {
        en: "activities-for-matching-patterns",
        hr: "zabavne-aktivnosti-s-nizovima",
      },
      label: { en: "The full pattern activity", hr: "Cijela aktivnost o nizovima" },
    },
    download: {
      id: "pattern-starter",
      href: {
        en: "/downloads/pattern-starter-pack.pdf",
        hr: "/downloads/predlozak-uzoraka.pdf",
      },
      title: { en: "Pattern starter pack", hr: "Predložak uzoraka" },
      pages: 2,
      size: { en: "243 KB", hr: "245 KB" },
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
      en: "Search one million digits of Pi for your birthday or any number and see exactly where it appears. A free, playful way for kids to explore π.",
      hr: "Pretražite milijun znamenki broja Pi i pronađite svoj rođendan ili drugi broj. Besplatan alat pokazuje gdje se niz točno krije u broju π.",
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
      en: "Drag the hands of an interactive clock and watch it read the time back to you. A playful way to learn to tell time on an analog clock.",
      hr: "Povucite kazaljke interaktivnog sata i reći će vam koje je vrijeme, jednostavan i zabavan način za učenje čitanja analognog sata.",
    },
    description: {
      en: "Free interactive analog clock for kids: drag the hands to set a time, read it in words and digits, then practise telling time with quick challenges.",
      hr: "Besplatni interaktivni analogni sat za djecu: pomičite kazaljke, pročitajte vrijeme riječima i brojkama te vježbajte kroz kratke zadatke.",
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
      hr: "Besplatni prevoditelj Morseove abecede za djecu: pretvorite tekst u točkice i crtice, reproducirajte ga zvukom i svjetlom ili dešifrirajte poruku.",
    },
    related: {
      slug: {
        en: "history-of-communication-for-kids",
        hr: "povijest-komunikacije-za-djecu",
      },
      label: {
        en: "Discover how messages travelled before phones",
        hr: "Otkrijte kako su poruke putovale prije telefona",
      },
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
      en: "Free developmental leap calculator: enter your baby's due date to estimate all 10 leap periods in the first 20 months and see what families commonly notice.",
      hr: "Besplatni kalkulator skokova u razvoju: upišite termin poroda, procijenite razdoblja svih 10 skokova i pročitajte što obitelji često primjećuju.",
    },
    related: {
      slug: { en: "developmental-leaps", hr: "skokovi-u-razvoju" },
      label: {
        en: "All 10 developmental leaps and what to expect",
        hr: "Svih 10 skokova u razvoju i što očekivati",
      },
    },
  },
  {
    key: "color-mixer",
    slug: { en: "color-mixer", hr: "mijesanje-boja" },
    icon: "🎨",
    title: {
      en: "Color mixing lab",
      hr: "Laboratorij za miješanje boja",
    },
    tagline: {
      en: "Tap two paint pots and watch the new color appear, make it lighter or darker, then test yourself in the quiz.",
      hr: "Dodirnite dva lončića boje i gledajte kako nastaje nova boja. Isprobajte kako posvijetliti i potamniti boju. A možete se okušati i u kvizu da testirate svoje znanje.",
    },
    description: {
      en: "Free color mixing game for kids: mix primary paints into secondary and tertiary colors, explore tints and shades, switch to light (RGB) mode and take the quiz.",
      hr: "Besplatna igra miješanja boja za djecu: miješajte primarne boje u sekundarne i tercijarne, istražite tonove, prebacite na svjetlost (RGB) i riješite kviz.",
    },
    related: {
      slug: {
        en: "learning-colors-how-to-teach-your-child-about-colors",
        hr: "ucenje-boja-najzabavniji-nacin-kako-dijete-nauciti-o-bojama",
      },
      label: { en: "The full colors activity", hr: "Cijela aktivnost o bojama" },
    },
    materials: [
      { name: { en: "Food coloring", hr: "Boje za hranu" }, q: { en: "food coloring", hr: "prehrambene boje" } },
      { name: { en: "Small clear bottles", hr: "Male prozirne bočice" }, q: { en: "small clear bottles kids craft", hr: "male prozirne bočice" } },
    ],
    download: {
      id: "color-lab",
      href: {
        en: "/downloads/color-mixing-lab.pdf",
        hr: "/downloads/laboratorij-boja.pdf",
      },
      title: { en: "Color mixing worksheet pack", hr: "Radni listovi za miješanje boja" },
      pages: 2,
      size: { en: "267 KB", hr: "269 KB" },
    },
  },
  {
    key: "number-systems",
    status: "draft",
    slug: { en: "number-system-converter", hr: "pretvarac-brojevnih-sustava" },
    icon: "🔢",
    title: {
      en: "Number system converter",
      hr: "Pretvarač brojevnih sustava",
    },
    tagline: {
      en: "Type any number and see how seven civilisations would have written it, from tally marks and hieroglyphs to binary.",
      hr: "Upišite bilo koji broj i vidite kako bi ga zapisalo sedam civilizacija, od crtica i hijeroglifa do binarnog koda.",
    },
    description: {
      en: "Free number system converter for kids: write any number in tally marks, Egyptian, Babylonian, Maya, Roman, binary and our own digits, and compare how many symbols each one needs.",
      hr: "Besplatni pretvarač brojevnih sustava za djecu: zapišite broj crticama te egipatskim, babilonskim, majanskim, rimskim i binarnim brojevima i usporedite koliko znakova svaki treba.",
    },
    related: {
      slug: {
        en: "history-of-numbers-for-kids",
        hr: "povijest-brojeva-za-djecu",
      },
      label: {
        en: "Read the story behind the numbers",
        hr: "Pročitajte priču koja stoji iza brojeva",
      },
    },
  },
  {
    key: "weight-on-planets",
    status: "draft",
    slug: { en: "weight-on-other-planets", hr: "koliko-tezim-na-drugim-planetima" },
    icon: "🪐",
    title: {
      en: "What do you weigh on other planets?",
      hr: "Koliko biste težili na drugim planetima?",
    },
    tagline: {
      en: "Type your weight and see what the scale would read on nine worlds, and how high you could jump on each one.",
      hr: "Upišite svoju težinu i vidite što bi vaga pokazala na devet svjetova i koliko biste visoko skočili na svakom.",
    },
    description: {
      en: "Free weight on other planets calculator for kids: enter your weight in kg or lb and see it on Mercury, Mars, Jupiter, the Moon and more, plus how high you could jump there.",
      hr: "Besplatni kalkulator težine na drugim planetima za djecu: upišite težinu u kilogramima i vidite je na Merkuru, Marsu, Jupiteru, Mjesecu i drugdje, uz visinu skoka.",
    },
    related: {
      slug: {
        en: "where-do-we-live-in-the-universe",
        hr: "gdje-zivimo-u-svemiru",
      },
      label: {
        en: "Take the tour of all nine worlds",
        hr: "Prošećite se kroz svih devet svjetova",
      },
    },
  },
  {
    key: "prime-explorer",
    status: "draft",
    slug: { en: "prime-number-explorer", hr: "istrazivac-prostih-brojeva" },
    icon: "🧮",
    title: {
      en: "Prime number explorer",
      hr: "Istraživač prostih brojeva",
    },
    tagline: {
      en: "Cross out the multiples on a 1 to 100 grid and watch the 25 primes appear, then see why a prime can only ever make one rectangle.",
      hr: "Prekrižite višekratnike na mreži od 1 do 100 i gledajte kako se pojavljuje 25 prostih brojeva, a onda otkrijte zašto prosti broj može složiti samo jedan pravokutnik.",
    },
    description: {
      en: "Free prime numbers tool for kids: run the Sieve of Eratosthenes on a 1 to 100 grid, build factor rectangles for any number, and test yourself with a prime-or-not quiz.",
      hr: "Besplatni alat za proste brojeve za djecu: pokrenite Eratostenovo sito na mreži od 1 do 100, složite pravokutnike za bilo koji broj i provjerite se kvizom prost ili nije.",
    },
    related: {
      slug: {
        en: "prime-numbers-for-kids",
        hr: "prosti-brojevi-za-djecu",
      },
      label: {
        en: "Read how the crossing-out trick works",
        hr: "Pročitajte kako radi trik s prekrižavanjem",
      },
    },
    download: {
      id: "prime-sieve",
      href: {
        en: "/downloads/prime-sieve-grid.pdf",
        hr: "/downloads/sito-prostih-brojeva.pdf",
      },
      title: { en: "Prime sieve grid", hr: "Sito prostih brojeva" },
      pages: 2,
      size: { en: "245 KB", hr: "247 KB" },
    },
  },
  {
    key: "guess-my-number",
    slug: { en: "guess-my-number", hr: "pogodi-broj" },
    icon: "🎯",
    title: {
      en: "Guess my number in 7 questions",
      hr: "Pogodi broj u 7 pitanja",
    },
    tagline: {
      en: "Think of a number from 1 to 100 and this will find it in seven questions, then let you try the same trick on it.",
      hr: "Zamislite broj od 1 do 100 i alat će ga naći u sedam pitanja, a onda vi možete isprobati isti trik na njemu.",
    },
    description: {
      en: "Free binary search game for kids: think of a number from 1 to 100 and watch it be found in 7 questions by halving, then see why 10 questions are enough for 1000.",
      hr: "Besplatna igra binarnog traženja za djecu: zamislite broj od 1 do 100 i gledajte kako ga polovljenje nađe u 7 pitanja, pa vidite zašto je 10 pitanja dovoljno za 1000.",
    },
    related: {
      slug: {
        en: "guess-my-number-in-7-questions",
        hr: "pogodi-broj-u-7-pitanja",
      },
      label: {
        en: "Read why halving always wins",
        hr: "Pročitajte zašto polovljenje uvijek pobjeđuje",
      },
    },
  },
  {
    key: "truss-tester",
    status: "draft",
    slug: { en: "shape-strength-tester", hr: "ispitivac-cvrstoce-oblika" },
    icon: "📐",
    title: {
      en: "Shape strength tester",
      hr: "Ispitivač čvrstoće oblika",
    },
    tagline: {
      en: "Push a square frame and watch it fold, add one diagonal and watch it hold, then brace a bridge before the truck arrives.",
      hr: "Gurnite kvadratni okvir i gledajte kako se preklapa, dodajte jednu dijagonalu i gledajte kako drži, pa ukrutite most prije nego što stigne kamion.",
    },
    description: {
      en: "Free structures tool for kids: rack a square frame, brace it into triangles, build a truss bridge that survives the load, and learn the 2J − 3 counting rule.",
      hr: "Besplatni alat o konstrukcijama za djecu: nakrivite kvadratni okvir, ukrutite ga u trokute, složite rešetkasti most koji izdrži opterećenje i naučite pravilo 2S − 3.",
    },
    related: {
      slug: {
        en: "why-triangles-are-the-strongest-shape",
        hr: "zasto-je-trokut-najjaci-oblik",
      },
      label: {
        en: "Read why the triangle wins",
        hr: "Pročitajte zašto trokut pobjeđuje",
      },
    },
    download: {
      id: "bridge-lab",
      href: {
        en: "/downloads/bridge-test-lab.pdf",
        hr: "/downloads/laboratorij-za-mostove.pdf",
      },
      title: { en: "Bridge test lab", hr: "Laboratorij za mostove" },
      pages: 2,
      size: { en: "180 KB", hr: "183 KB" },
    },
  },
];

/** The only tool collection public surfaces may consume. Keeping the filter
 *  here makes an accidental deploy of in-progress tool code harmless. */
export const tools: Tool[] = allTools.filter((tool) => tool.status !== "draft");

/** Curated, stable set used on high-traffic discovery surfaces. */
export const FEATURED_TOOL_KEYS = [
  "clock",
  "name-in-binary",
  "color-mixer",
  "developmental-leaps",
] as const;

const TOOL_RECOMMENDATIONS: Record<string, readonly string[]> = {
  "name-in-binary": ["caesar-cipher", "morse-code", "pattern-maker"],
  "caesar-cipher": ["morse-code", "name-in-binary", "tower-of-hanoi"],
  "tower-of-hanoi": ["fraction-visualizer", "multiplication-visualizer", "pattern-maker"],
  "activity-spinner": ["color-mixer", "pattern-maker", "clock"],
  "fraction-visualizer": ["multiplication-visualizer", "clock", "tower-of-hanoi"],
  "multiplication-visualizer": ["fraction-visualizer", "pattern-maker", "tower-of-hanoi"],
  "pattern-maker": ["multiplication-visualizer", "color-mixer", "activity-spinner"],
  "find-birthday-in-pi": ["fraction-visualizer", "tower-of-hanoi", "clock"],
  clock: ["fraction-visualizer", "pattern-maker", "activity-spinner"],
  "morse-code": ["caesar-cipher", "name-in-binary", "activity-spinner"],
  "developmental-leaps": ["clock", "pattern-maker", "activity-spinner"],
  "color-mixer": ["pattern-maker", "activity-spinner", "fraction-visualizer"],
};

export function toolsByKey(keys: readonly string[]): Tool[] {
  return keys
    .map((key) => tools.find((tool) => tool.key === key))
    .filter((tool): tool is Tool => Boolean(tool));
}

/** Find the public tool that was made as a companion to an article. */
export function toolForRelatedPost(lang: Lang, postSlug: string): Tool | undefined {
  return tools.find((tool) => tool.related?.slug[lang] === postSlug);
}

/** Curated next choices keep tool landing pages connected instead of dead-ending. */
export function recommendedTools(toolKey: string): Tool[] {
  return toolsByKey(TOOL_RECOMMENDATIONS[toolKey] ?? []).slice(0, 3);
}

export function toolBySlug(lang: Lang, slug: string): Tool | undefined {
  return tools.find((t) => t.slug[lang] === slug);
}
