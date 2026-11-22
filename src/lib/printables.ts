/**
 * Registry for the printables hub (`/en/printables`, HR `/hr/materijali-za-ispis`):
 * one entry per printable PDF, browser-safe so the hub, the sitemap and the
 * validator can all read it. File sizes are read from disk at build time by the
 * hub, page counts are hand-kept here (PDF page trees are compressed, so they
 * can't be counted cheaply).
 *
 * Visibility is automatic: a printable whose `home` is a post shows only once
 * that post is published in the language; one whose home is a seasonal landing
 * page shows only once its campaign is `live` (src/lib/seasonal.ts). A language
 * with no `file` simply hides the card there.
 *
 * Adding a printable: build the PDF, run `node scripts/build-printable-thumbs.mjs`
 * for its page-1 preview, then add an entry here. `npm run validate` flags any
 * PDF in public/downloads that no entry claims.
 */
export type Lang = "en" | "hr";
type L = Record<Lang, string>;

export const PRINTABLES_SLUG: L = { en: "printables", hr: "materijali-za-ispis" };

export type PrintableGroup = "science" | "engineering" | "math" | "minds" | "seasonal";

/** Hub section order. */
export const PRINTABLE_GROUPS: PrintableGroup[] = ["science", "engineering", "math", "minds", "seasonal"];

export type PrintableHome =
  /** A post, by translationKey. Drafts hide the card. */
  | { post: string }
  /** A landing page slug per language. `campaign` = seasonal.ts id that gates it. */
  | { page: L; campaign?: string };

export interface PrintableEntry {
  /** GTM tracking id. Must match the `id` on the same printable's <Printable>
   *  cards and tools.ts `download`, so every surface reports as one download. */
  id: string;
  group: PrintableGroup;
  /** PDF path under /public, per language. */
  file: Partial<Record<Lang, string>>;
  title: L;
  /** One or two lines for the hub card. */
  blurb: L;
  pages: number;
  ages?: L;
  home: PrintableHome;
}

export const printables: PrintableEntry[] = [
  // ── Science & space ──────────────────────────────────────────────────────
  {
    id: "color-lab",
    group: "science",
    file: { en: "/downloads/color-mixing-lab.pdf", hr: "/downloads/laboratorij-boja.pdf" },
    title: { en: "Color mixing worksheet pack", hr: "Radni listovi za miješanje boja" },
    blurb: {
      en: "Mixing equations to color in, a color wheel to complete and a lab notebook for the bottle experiment.",
      hr: "Za bojanje bez ekrana: formule miješanja, kotač boja i dnevnik miješanja.",
    },
    pages: 2,
    ages: { en: "Ages 3+", hr: "Od 3 godine" },
    home: { post: "teach-child-colors-fun-way" },
  },
  {
    // EN only: there's no HR PDF yet, so the HR hub skips it (empty HR copy is never shown).
    id: "gummy-bear-osmosis-lab",
    group: "science",
    file: { en: "/downloads/gummy-bear-osmosis-lab-sheet.pdf" },
    title: { en: "Gummy bear osmosis lab sheet", hr: "" },
    blurb: {
      en: "Plan a fair test, record before-and-after measurements, compare four gummy bears and write a conclusion from the evidence.",
      hr: "",
    },
    pages: 2,
    ages: { en: "Ages 6+", hr: "Od 6 godina" },
    home: { post: "gummy-bears-osmosis-experiment" },
  },
  {
    id: "sourdough-journal",
    group: "science",
    file: { en: "/downloads/sourdough-starter-journal.pdf", hr: "/downloads/dnevnik-kvasca-za-kiselo-tijesto.pdf" },
    title: { en: "My sourdough starter journal", hr: "Moj dnevnik kvasca za kiselo tijesto" },
    blurb: {
      en: "A 7-day log: draw how high the starter rose, circle the bubbles, note the smell and finish with the float test.",
      hr: "Dnevnik kroz 7 dana: nacrtaj koliko se kvasac digao, zaokruži mjehuriće, zapiši miris i završi testom plutanja.",
    },
    pages: 2,
    ages: { en: "Ages 5+", hr: "Od 5 godina" },
    home: { post: "how-to-make-sourdough-starter" },
  },
  {
    id: "moon-journal",
    group: "science",
    file: { en: "/downloads/moon-observation-journal.pdf", hr: "/downloads/dnevnik-promatranja-mjeseca.pdf" },
    title: { en: "My Moon observation journal", hr: "Moj dnevnik promatranja Mjeseca" },
    blurb: {
      en: "Record eight observations, draw the lit shape and use the reflection questions to explain the pattern you found.",
      hr: "Zabilježite osam promatranja, nacrtajte osvijetljeni oblik i pomoću pitanja objasnite uzorak koji ste pronašli.",
    },
    pages: 2,
    ages: { en: "Ages 8+", hr: "Od 8 godina" },
    home: { post: "moon-phases-for-kids" },
  },
  {
    id: "cosmic-address",
    group: "science",
    file: { en: "/downloads/your-cosmic-address.pdf", hr: "/downloads/tvoja-svemirska-adresa.pdf" },
    title: { en: "Your cosmic address", hr: "Tvoja svemirska adresa" },
    blurb: {
      en: "A fill-in address card from your name out to the observable Universe, plus a ladder of cosmic sizes to colour in.",
      hr: "Adresnica za popunjavanje, od imena sve do vidljivog svemira, i ljestve svemirskih veličina za bojanje.",
    },
    pages: 2,
    home: { post: "where-do-we-live-in-the-universe" },
  },
  {
    id: "habitable-planet",
    group: "science",
    file: { en: "/downloads/design-a-living-world.pdf", hr: "/downloads/osmisli-svijet-sa-zivotom.pdf" },
    title: { en: "Design a world that could hold life", hr: "Osmisli svijet koji bi mogao imati život" },
    blurb: {
      en: "Use five search clues to invent and label a planet or moon, then decide what makes it promising.",
      hr: "Pomoću pet tragova izmislite i označite planet ili mjesec, a zatim odlučite što ga čini obećavajućim.",
    },
    pages: 2,
    ages: { en: "Ages 6+", hr: "Od 6 godina" },
    home: { post: "what-does-life-need-goldilocks-zone" },
  },

  // ── Engineering & codes ──────────────────────────────────────────────────
  {
    id: "cipher-wheel",
    group: "engineering",
    file: { en: "/downloads/cipher-wheel-template.pdf", hr: "/downloads/kotac-za-sifriranje-predlozak.pdf" },
    title: { en: "Cipher wheel template", hr: "Predložak kotača za šifriranje" },
    blurb: {
      en: "Two ready-to-cut wheels with assembly steps and secret-code instructions: print, cut, pin and start encoding.",
      hr: "Dva kotača za izrezivanje s uputama za sastavljanje i šifriranje, s punom hrvatskom abecedom od 30 slova.",
    },
    pages: 2,
    ages: { en: "Ages 7+", hr: "Od 7 godina" },
    home: { post: "how-to-make-cipher-wheel" },
  },
  {
    id: "engineering-notebook",
    group: "engineering",
    file: { en: "/downloads/engineering-notebook.pdf", hr: "/downloads/inzenjerska-biljeznica.pdf" },
    title: { en: "My engineering notebook", hr: "Moja inženjerska bilježnica" },
    blurb: {
      en: "The design loop, an ask-and-imagine sheet, a plan page with a big drawing box and a three-round test log.",
      hr: "Krug na prvoj stranici, list za pitanje i zamišljanje, stranica za plan s velikim okvirom za crtež i dnevnik ispitivanja.",
    },
    pages: 4,
    ages: { en: "Ages 6+", hr: "Od 6 godina" },
    home: { post: "engineering-design-process-for-kids" },
  },
  {
    id: "bridge-lab",
    group: "engineering",
    file: { en: "/downloads/bridge-test-lab.pdf", hr: "/downloads/laboratorij-za-mostove.pdf" },
    title: { en: "Bridge test lab", hr: "Laboratorij za mostove" },
    blurb: {
      en: "Six frames to build and push over with predict-then-test boxes, plus a bridge to brace and a coin-test load log.",
      hr: "Šest okvira za slaganje i guranje s okvirićima za predviđanje, plus most za ukrućivanje i dnevnik pokusa s kovanicama.",
    },
    pages: 2,
    ages: { en: "Ages 6+", hr: "Od 6 godina" },
    home: { post: "why-triangles-are-the-strongest-shape" },
  },

  // ── Math & patterns ──────────────────────────────────────────────────────
  {
    id: "pattern-starter",
    group: "math",
    file: { en: "/downloads/pattern-starter-pack.pdf", hr: "/downloads/predlozak-uzoraka.pdf" },
    title: { en: "Pattern starter pack", hr: "Predložak uzoraka" },
    blurb: {
      en: "Pattern rows to complete by hand, plus a sheet of shapes to cut out and arrange on blank strips.",
      hr: "Redovi uzoraka za dovršavanje rukom i list s oblicima za izrezivanje i slaganje na prazne trake.",
    },
    pages: 2,
    ages: { en: "Ages 3+", hr: "Od 3 godine" },
    home: { post: "activities-for-matching-patterns" },
  },
  {
    id: "clock-face",
    group: "math",
    file: { en: "/downloads/clock-face-template.pdf", hr: "/downloads/predlozak-sata.pdf" },
    title: { en: "Clock face template", hr: "Predložak sata s kazaljkama" },
    blurb: {
      en: "A plain clock face and hands to cut out, decorate and pin together, a quick reading guide and a practice sheet for drawing and reading times.",
      hr: "Jednostavan brojčanik i kazaljke za izrezivanje, ukrašavanje i spajanje, kratke upute za čitanje sata i list za vježbu crtanja i čitanja vremena.",
    },
    pages: 3,
    ages: { en: "Ages 4+", hr: "Od 4 godine" },
    home: { post: "make-cardboard-clock-learn-tell-time" },
  },
  {
    id: "multiplication-practice",
    group: "math",
    file: {
      en: "/downloads/multiplication-practice-pack.pdf",
      hr: "/downloads/tablica-mnozenja-listovi-za-vjezbu.pdf",
    },
    title: { en: "Multiplication practice pack", hr: "Tablica množenja: listovi za vježbu" },
    blurb: {
      en: "A blank times table to fill in, dot arrays to flip and break apart, the 15 target facts with a route tracker, and a mixed practice page with answers.",
      hr: "Prazna tablica množenja za popunjavanje, polja točaka za okretanje i rastavljanje, 15 ciljnih činjenica s praćenjem puteva i list pomiješanih zadataka s rješenjima.",
    },
    pages: 4,
    ages: { en: "Ages 8+", hr: "Od 8 godina" },
    home: { post: "how-to-learn-multiplication-tables" },
  },
  {
    id: "mobius-strips",
    group: "math",
    file: { en: "/downloads/mobius-strip-pack.pdf", hr: "/downloads/mobiusova-vrpca-predlozak.pdf" },
    title: { en: "Möbius strip pack", hr: "Möbiusova vrpca - predložak" },
    blurb: {
      en: "Seven ready-made strips with the tape tabs and cutting lines marked, plus a prediction table for 0, 1 and 2 twists.",
      hr: "Sedam gotovih vrpci s označenim jezičcima za traku i linijama za rezanje, plus tablica predviđanja za 0, 1 i 2 zavrtanja.",
    },
    pages: 2,
    ages: { en: "Ages 6+", hr: "Od 6 godina" },
    home: { post: "mobius-strip-activity" },
  },
  {
    id: "prime-sieve",
    group: "math",
    file: { en: "/downloads/prime-sieve-grid.pdf", hr: "/downloads/sito-prostih-brojeva.pdf" },
    title: { en: "Prime sieve grid", hr: "Sito prostih brojeva" },
    blurb: {
      en: "The 1 to 100 grid with a colour key for multiples of 2, 3, 5 and 7, plus dot groups to test any number by hand.",
      hr: "Mreža od 1 do 100 s bojama za višekratnike brojeva 2, 3, 5 i 7, plus točkice za provjeru bilo kojeg broja rukom.",
    },
    pages: 2,
    ages: { en: "Ages 7+", hr: "Od 7 godina" },
    home: { post: "prime-numbers-for-kids" },
  },

  // ── Feelings & growing up (Mind Explorers) ───────────────────────────────
  {
    id: "curious-calm-school-kit",
    group: "minds",
    file: { en: "/downloads/curious-and-calm-school-kit.pdf", hr: "/downloads/znatizeljno-i-mirno-skolski-paket.pdf" },
    title: { en: "Curious and Calm school starter kit", hr: "Znatiželjno i mirno: paket za početak škole" },
    blurb: {
      en: "A readiness portrait, school-day story, picture morning routine, feelings check-in, worry-to-plan sheet and five-day challenge.",
      hr: "Slika spremnosti, priča o školskom danu, slikovna jutarnja rutina, provjera osjećaja, list od brige do plana i petodnevni izazov.",
    },
    pages: 8,
    home: { post: "curious-and-calm-back-to-school" },
  },
  {
    id: "brave-steps",
    group: "minds",
    file: { en: "/downloads/brave-steps-fear-ladder.pdf", hr: "/downloads/hrabri-koraci-ljestvica-straha.pdf" },
    title: { en: "Brave Steps: a fear ladder and brave toolbox", hr: "Hrabri koraci: ljestvica straha i kutija hrabrosti" },
    blurb: {
      en: "One small step on each rung and a star for every climb, plus calm breathing, brave words and a worry thermometer.",
      hr: "Jedan mali korak na svakoj prečki i zvjezdica za svaki uspon, plus mirno disanje, hrabre rečenice i termometar brige.",
    },
    pages: 2,
    home: { post: "childhood-fears-by-age" },
  },
  {
    id: "spaced-review-calendar",
    group: "minds",
    file: { en: "/downloads/spaced-review-calendar.pdf", hr: "/downloads/kalendar-ponavljanja.pdf" },
    title: { en: "Spaced review calendar", hr: "Kalendar ponavljanja" },
    blurb: {
      en: "Write down one thing learned, then come back to it the next day, in 3 days, in a week and in 2 weeks, with a smiley for every try.",
      hr: "Upiši jednu naučenu stvar i vrati joj se sutradan, za 3 dana, za tjedan i za 2 tjedna, uz smajlić za svaki pokušaj.",
    },
    pages: 1,
    home: { post: "spaced-practice-for-kids" },
  },
  {
    id: "retrieval-grids",
    group: "minds",
    file: { en: "/downloads/retrieval-practice-grids.pdf", hr: "/downloads/mreze-za-ponavljanje.pdf" },
    title: { en: "Retrieval grids in 3 levels", hr: "Mreže za ponavljanje u 3 razine" },
    blurb: {
      en: "A picture grid for ages 6 to 8, a question grid for 9 to 11 and a points grid for 12 and up: try first, then check.",
      hr: "Slikovna mreža za 6 do 8 godina, mreža pitanja za 9 do 11 i mreža s bodovima za 12 i više: prvo pokušaj, onda provjeri.",
    },
    pages: 3,
    home: { post: "retrieval-practice-activities" },
  },
  {
    id: "first-map",
    group: "minds",
    file: { en: "/downloads/the-first-map.pdf", hr: "/downloads/prva-karta.pdf" },
    title: { en: "The First Map", hr: "Prva karta" },
    blurb: {
      en: "An illustrated keepsake guide to your baby’s ten developmental leaps, from week 5 to week 75.",
      hr: "Ilustrirani vodič za uspomenu kroz deset razvojnih skokova vaše bebe, od 5. do 75. tjedna.",
    },
    pages: 21,
    ages: { en: "For parents of babies", hr: "Za roditelje beba" },
    home: { page: { en: "the-first-map", hr: "prva-karta" } },
  },

  // ── Seasonal packs ───────────────────────────────────────────────────────
  {
    id: "summer",
    group: "seasonal",
    file: { en: "/downloads/summer-of-curiosity.pdf", hr: "/downloads/ljeto-znatizelje.pdf" },
    title: { en: "Summer of curiosity e-book", hr: "Ljeto znatiželje, e-knjiga" },
    blurb: {
      en: "30+ screen-free science activities sorted by age, with a rainy-day list, parent tips and summer bingo.",
      hr: "30+ znanstvenih aktivnosti bez ekrana po dobi, s popisom za kišne dane, savjetima za roditelje i ljetnim bingom.",
    },
    pages: 10,
    ages: { en: "Ages 1–12", hr: "1–14 godina" },
    home: { page: { en: "summer", hr: "ljeto" } },
  },
  {
    id: "potion-lab-pack",
    group: "seasonal",
    file: { en: "/downloads/pumpkins-and-potions-lab-pack.pdf", hr: "/downloads/bundeve-i-napici-laboratorij.pdf" },
    title: { en: "Pumpkins & Potions lab pack", hr: "Bundeve i čarobni napici: laboratorijski paket" },
    blurb: {
      en: "A potion record sheet with a pH rainbow, a slime and oobleck lab, an autumn colour hunt and 10 cut-out potion labels.",
      hr: "List za bilježenje napitaka s pH bojama duge, laboratorij sluzi i oobleka, jesenski lov na boje i 10 etiketa za staklenke.",
    },
    pages: 4,
    home: { page: { en: "pumpkins-and-potions", hr: "bundeve-i-carobni-napici" }, campaign: "pumpkins-and-potions" },
  },
  {
    id: "advent-calendar",
    group: "seasonal",
    file: { en: "/downloads/stem-advent-calendar.pdf", hr: "/downloads/stem-adventski-kalendar.pdf" },
    title: { en: "STEM Advent Calendar", hr: "STEM adventski kalendar" },
    blurb: {
      en: "A 24-door calendar to colour in, a six-fold snowflake guide with three cutting templates, and gift tags.",
      hr: "Kalendar s 24 prozorčića za bojanje, vodič za pahulje sa šest krakova s tri predloška za rezanje i privjesci za darove.",
    },
    pages: 4,
    ages: { en: "Ages 3+", hr: "Od 3 godine" },
    home: { page: { en: "stem-advent-calendar", hr: "adventski-kalendar" }, campaign: "advent-calendar" },
  },
];

/**
 * Subscriber-only bonus pack: the one printable that is NOT a free download on
 * the hub. New subscribers get it on the welcome page (and in the Mailchimp
 * welcome email, which links the same file). Keep the PDF under
 * `public/downloads/subscribers/`: that folder is skipped by the thumbnail
 * script and the validator's "not on the hub" check, and next.config sends
 * `X-Robots-Tag: noindex` for it. The link is unlisted, not access-controlled.
 *
 * `null` = no pack yet: the hub's signup band then promises only "new
 * printables by email" and the welcome page shows no download.
 */
export interface SubscriberBonus {
  /** Tracking id, reported like every other printable (`resource_download`). */
  id: string;
  file: Partial<Record<Lang, string>>;
  title: L;
  blurb: L;
  pages: number;
}

export const SUBSCRIBER_BONUS: SubscriberBonus | null = {
  // Built by scripts/build-experiment-journal-pdf.mjs.
  id: "experiment-journal",
  file: {
    en: "/downloads/subscribers/little-explorers-experiment-journal.pdf",
    hr: "/downloads/subscribers/dnevnik-pokusa-malog-istrazivaca.pdf",
  },
  title: { en: "Little Explorer’s experiment journal", hr: "Dnevnik pokusa malog istraživača" },
  blurb: {
    en: "A reusable journal for any experiment: question, prediction, plan, before-and-after drawings and results, plus a log of 10 experiments and a certificate to earn.",
    hr: "Dnevnik koji možete koristiti uz svaki pokus: pitanje, predviđanje, plan, crteži prije i poslije i rezultati, uz popis 10 pokusa i diplomu koju treba zaslužiti.",
  },
  pages: 4,
};

/** Page-1 preview rendered by scripts/build-printable-thumbs.mjs. */
export function printableThumb(file: string): string {
  return file.replace(/^\/downloads\//, "/images/printables/").replace(/\.pdf$/, ".jpg");
}
