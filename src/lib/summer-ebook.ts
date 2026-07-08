/**
 * Content model for the "Summer of curiosity" e-book — a free, age-sorted
 * collection of summer STEM activities. Single source of truth shared by:
 *   - the on-site landing page / lead magnet (`/en/summer`, `/hr/ljeto`)
 *   - the downloadable PDF (scripts/build-summer-pdf.mjs)
 *
 * Browser-safe (no Node imports). All activity `slug`s point at real posts;
 * links resolve to `/{lang}/{slug}`. `icon` fields hold an emoji; `cover` holds
 * the post's cover-image path (or null → the PDF falls back to the emoji tile).
 */

export type Lang = "en" | "hr";
type L = Record<Lang, string>;

export interface Activity {
  /** Per-language post slug (links to /{lang}/{slug}). */
  slug: Record<Lang, string>;
  /** Per-language cover-image path under /public (null → no photo). */
  cover: Record<Lang, string | null>;
  icon: string;
  name: L;
  blurb: L;
  /** Short "you'll need" line. */
  materials: L;
  /** Short active-time label (e.g. "15 min", "5 min + overnight"). */
  time: L;
  /** Mess rating, 1 (tidy) – 3 (take it outside). */
  mess: 1 | 2 | 3;
  /** Works happily indoors → featured in the rainy-day subset. */
  indoor?: boolean;
}

export interface Section {
  key: string;
  /** Brand hex for the section band + bullets (fixed; print-stable). */
  color: string;
  icon: string;
  age: L;
  title: L;
  activities: Activity[];
}

export interface Tip {
  icon: string;
  title: L;
  body: L;
}

export const SUMMER_PDF: Record<Lang, string> = {
  en: "/downloads/summer-of-curiosity.pdf",
  hr: "/downloads/ljeto-znatizelje.pdf",
};

/** Landing-page slug per language (used for routes + hreflang). */
export const SUMMER_SLUG: Record<Lang, string> = {
  en: "summer",
  hr: "ljeto",
};

export const summerCopy: Record<Lang, {
  eyebrow: string;
  title: string;
  subtitle: string;
  intro: string;
  download: string;
  downloadNote: string;
  sectionsHeading: string;
  tipsTitle: string;
  tipsAge: string;
  guide: string;
  youllNeed: string;
  messLabel: string;
  rainyKicker: string;
  rainyTitle: string;
  rainyBody: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
}> = {
  en: {
    eyebrow: "Free summer e-book",
    title: "Summer of curiosity",
    subtitle:
      "30+ screen-free science adventures for long, sunny days, sorted by age and ready for the backyard.",
    intro:
      "School's out and the days are long. This free e-book rounds up our favourite hands-on STEM activities for summer - pick your child's age, grab a few things from the kitchen, and let the experimenting begin.",
    download: "Download the free PDF",
    downloadNote: "Printable · no sign-up needed",
    sectionsHeading: "Pick an age and dive in",
    tipsTitle: "Summer survival kit for parents",
    tipsAge: "for grown-ups",
    guide: "Full guide",
    youllNeed: "You'll need",
    messLabel: "Mess",
    rainyKicker: "when the weather turns",
    rainyTitle: "Rainy-day rescue",
    rainyBody:
      "Grey skies? These ones happily move indoors, to the kitchen table or the living-room floor.",
    ctaTitle: "Want more sunny science?",
    ctaBody:
      "This is just a taste, there are 50+ experiments on the site, with new ones every week.",
    ctaButton: "Explore all activities",
  },
  hr: {
    eyebrow: "Besplatna ljetna e-knjiga",
    title: "Ljeto znatiželje",
    subtitle:
      "30+ znanstvenih avantura bez ekrana za duge, sunčane dane, posloženih po dobi i spremnih za dvorište.",
    intro:
      "Škola je gotova, a dani su dugi. Ova besplatna e-knjiga donosi naše omiljene STEM aktivnosti za ljeto - odaberite dob djeteta, uzmite nekoliko stvari iz kuhinje i neka eksperimentiranje počne!",
    download: "Preuzmite besplatni PDF",
    downloadNote: "Za ispis · bez registracije",
    sectionsHeading: "Odaberite dob i zaronite",
    tipsTitle: "Ljetni priručnik za roditelje",
    tipsAge: "za odrasle",
    guide: "Cijeli vodič",
    youllNeed: "Trebat će vam",
    messLabel: "Nered",
    rainyKicker: "kad vrijeme zakaže",
    rainyTitle: "Spas za kišne dane",
    rainyBody:
      "Ljetne oluje? Ove se aktivnosti lako sele unutra, na kuhinjski stol ili pod dnevnog boravka.",
    ctaTitle: "Želite još sunčane znanosti?",
    ctaBody:
      "Ovo je tek djelić, na stranici vas čeka 50+ pokusa, a novi stižu svaki tjedan.",
    ctaButton: "Istražite sve aktivnosti",
  },
};

export const summerSections: Section[] = [
  {
    key: "toddlers",
    color: "#FB6F52",
    icon: "🧸",
    age: { en: "ages 1–3 · toddlers", hr: "1–3 godine · najmlađi" },
    title: {
      en: "Little explorers - sensory & squishy",
      hr: "Mali istraživači - senzorno i taktilno",
    },
    activities: [
      {
        slug: {
          en: "homemade-sensory-bottle-child-sensory-development",
          hr: "kako-napraviti-senzornu-bocu-za-poticanje-senzomotorickog-razvoja-djeteta",
        },
        cover: {
          en: "/images/posts/Homemade-Sensory-Bottle-for-Child-Sensory-development-Cover-Picture.jpg",
          hr: "/images/posts/Homemade-Sensory-Bottle-for-Child-Sensory-development-Cover-Picture.jpg",
        },
        icon: "✨",
        name: { en: "Calm-down sensory bottle", hr: "Senzorna boca za regulaciju emocija" },
        blurb: {
          en: "Glitter swirling slowly through water - mesmerizing for little hands, and a sneaky lesson in density.",
          hr: "Šljokice koje polako plešu u vodi - vizualno očaravajuće, a i usputna lekcija o gustoći.",
        },
        materials: {
          en: "a clear plastic bottle, water, clear glue, glitter",
          hr: "prozirna plastična boca, voda, prozirno ljepilo, šljokice",
        },
        time: { en: "10 min", hr: "10 min" },
        mess: 1,
        indoor: true,
      },
      {
        slug: { en: "how-to-make-colored-rice", hr: "kako-napraviti-obojanu-rizu" },
        cover: {
          en: "/images/posts/How-to-Make-a-Colored-Rainbow-Rice.webp",
          hr: "/images/posts/Kako-napraviti-Rižu-u-Duginim-Bojama-Kucna-aktivnost-za-Djecu-Pocetna-slika.jpg",
        },
        icon: "🌈",
        name: { en: "Rainbow rice sensory bin", hr: "Senzorna posuda s rižom u duginim bojama" },
        blurb: {
          en: "Dye rice in summer colors for scooping, pouring and burying treasures. Great for the porch.",
          hr: "Obojite rižu u ljetne boje za grabljenje, presipavanje i skrivanje blaga. Savršeno za terasu.",
        },
        materials: {
          en: "dry rice, food colouring, zip-lock bags, a tray",
          hr: "suha riža, prehrambene boje, vrećice na zatvaranje, pladanj",
        },
        time: { en: "20 min + drying", hr: "20 min + sušenje" },
        mess: 2,
      },
      {
        slug: { en: "make-homemade-playdough-learn-science", hr: "kako-napraviti-plastelin-kod-kuce" },
        cover: {
          en: "/images/posts/How-to-make-Homemade-Playdough-and-learn-Science-while-doing-it-Cover-Picture.jpg",
          hr: "/images/posts/Kako-napraviti-plastelin-kod-kuće-i-usput-naučiti-nešto-o-znanosti-Pocetna-slika.jpg",
        },
        icon: "🎨",
        name: { en: "Squishy homemade playdough", hr: "Gnjecavi domaći plastelin" },
        blurb: {
          en: "Mix together your own homemade playdough: squish, roll and learn what makes it stretchy.",
          hr: "Napravite domaći plastelin zajedno: gnječite, valjajte i otkrijte zašto je rastezljiv.",
        },
        materials: {
          en: "flour, salt, water, oil, cream of tartar, food colouring",
          hr: "brašno, sol, voda, ulje, vinski kamen, prehrambene boje",
        },
        time: { en: "15 min", hr: "15 min" },
        mess: 2,
        indoor: true,
      },
      {
        slug: { en: "make-sensory-play-colors", hr: "aktivnost-za-senzomotoricki-razvoj" },
        cover: { en: "/images/posts/sensory-play.jpg", hr: "/images/posts/sensory-play.jpg" },
        icon: "🌊",
        name: { en: "Color-mixing splash play", hr: "Igra miješanja boja" },
        blurb: {
          en: "Two colors in, a brand-new one out: messy, hands-on color discovery for the water table.",
          hr: "Od dvije boje može nastati treća: vesela, praktična igra otkrivanja boja.",
        },
        materials: {
          en: "water, food colouring, clear cups, a tray",
          hr: "voda, prehrambene boje, prozirne čaše, pladanj",
        },
        time: { en: "15 min", hr: "15 min" },
        mess: 3,
      },
    ],
  },
  {
    key: "preschool",
    color: "#E68A00",
    icon: "🧪",
    age: { en: "ages 3–5 · preschool", hr: "3–7 godina · vrtićka dob" },
    title: {
      en: "Curious preschoolers - kitchen magic",
      hr: "Znatiželjni predškolci - kuhinjska čarolija",
    },
    activities: [
      {
        slug: { en: "make-colorful-milk-polarity-experiment", hr: "kako-uciti-o-polaritetu-koristeci-mlijeko-i-boje" },
        cover: {
          en: "/images/posts/How-to-Make-Colorful-Milk-Polarity-Experiment-Cover-Image.jpg",
          hr: "/images/posts/How-to-Make-Colorful-Milk-Polarity-Experiment-Cover-Image.jpg",
        },
        icon: "🥛",
        name: { en: "Magic colorful milk", hr: "Čarobno šareno mlijeko" },
        blurb: {
          en: "A drop of soap sends colors exploding across the plate. Pure wow, zero cleanup stress.",
          hr: "Kap deterdženta izaziva eksploziju boja po tanjuru. Čisti „wow“, bez stresa oko čišćenja.",
        },
        materials: {
          en: "a plate, milk, food colouring, dish soap, a cotton bud",
          hr: "tanjur, mlijeko, prehrambene boje, deterdžent, štapić s vatom",
        },
        time: { en: "10 min", hr: "10 min" },
        mess: 1,
        indoor: true,
      },
      {
        slug: { en: "make-lava-lamp", hr: "kako-napraviti-lava-lampu" },
        cover: { en: "/images/posts/lava-lamp.jpg", hr: "/images/posts/lava-lamp.jpg" },
        icon: "🪔",
        name: { en: "Groovy lava lamp", hr: "Domaća lava lampa" },
        blurb: {
          en: "Bubbling blobs rise and fall in a bottle - a calm, hypnotic show for a hot afternoon.",
          hr: "Mjehurići se dižu i spuštaju u boci: smirujući, hipnotičan prizor za vruće poslijepodne.",
        },
        materials: {
          en: "a clear bottle, water, vegetable oil, food colouring, an effervescent tablet",
          hr: "prozirna boca, voda, jestivo ulje, prehrambene boje, šumeća tableta",
        },
        time: { en: "10 min", hr: "10 min" },
        mess: 1,
        indoor: true,
      },
      {
        slug: { en: "how-to-make-homemade-volcano", hr: "kako-napraviti-vulkan-kod-kuce" },
        cover: {
          en: "/images/posts/How-to-make-a-Homemade-Volcano-STEM-Science-for-Kids-Cover-Picture.jpg",
          hr: "/images/posts/Kako-napraviti-vulkan-kod-kuće-STEM-aktivnost-za-djecu-iz-znanosti-Početna-slika.jpg",
        },
        icon: "🌋",
        name: { en: "Erupting volcano", hr: "Vulkan koji erumpira" },
        blurb: {
          en: "The classic fizzing eruption: best done outside where the foam can go everywhere.",
          hr: "Klasična pjenušava erupcija: najbolje vani, gdje se pjena smije razliti posvuda.",
        },
        materials: {
          en: "baking soda, vinegar, dish soap, food colouring, a small bottle",
          hr: "soda bikarbona, ocat, deterdžent, prehrambene boje, bočica",
        },
        time: { en: "15 min", hr: "15 min" },
        mess: 3,
      },
      {
        slug: { en: "egg-in-vinegar-make-bouncy-glowing-egg", hr: "jaje-u-octu" },
        cover: {
          en: "/images/posts/How-to-make-bouncy-and-glowing-Egg-Cover-Image.jpg",
          hr: "/images/posts/Kako-napraviti-elasticno-jaje-koje-svijetli-Pocetna-Slika.jpg",
        },
        icon: "🥚",
        name: { en: "Bouncy (glowing!) egg", hr: "Elastično jaje (koje svijetli!)" },
        blurb: {
          en: "Soak an egg in vinegar for a few days and the shell vanishes, leaving a wobbly, bouncy egg.",
          hr: 'Potopite jaje u ocat na nekoliko dana i ljuska nestaje, ostaje mekano, "hopsavo" jaje.',
        },
        materials: {
          en: "a raw egg, a glass, white vinegar",
          hr: "sirovo jaje, čaša, bijeli ocat",
        },
        time: { en: "5 min + 2-day wait", hr: "5 min + 2 dana čekanja" },
        mess: 1,
        indoor: true,
      },
    ],
  },
  {
    key: "lower",
    color: "#14A098",
    icon: "🏕️",
    age: { en: "ages 6–8 · lower elementary", hr: "7–11 godina · niži razredi" },
    title: {
      en: "Junior scientists - backyard experiments",
      hr: "Mladi znanstvenici - pokusi u dvorištu",
    },
    activities: [
      {
        slug: { en: "how-to-make-homemade-rocket-vinegar-baking-soda", hr: "kako-napraviti-raketu-pomocu-octa-i-sode-bikarbone" },
        cover: {
          en: "/images/posts/How-to-make-Homemade-Rocket-with-Vinegar-and-Baking-Soda-Cover-Image.jpg",
          hr: "/images/posts/Kako-napraviti-raketu-pomocu-octa-i-sode-bikarbone-Pocetna-slika.jpg",
        },
        icon: "🚀",
        name: { en: "Baking-soda rocket", hr: "Raketa na sodu bikarbonu" },
        blurb: {
          en: "Vinegar + baking soda = lift-off. A loud, messy, gloriously summer-outside launch.",
          hr: "Ocat + soda bikarbona = polijetanje. Bučno, prljavo i savršeno ljetno lansiranje na otvorenom.",
        },
        materials: {
          en: "an empty plastic bottle, baking soda, vinegar, a cork, paper",
          hr: "prazna plastična boca, soda bikarbona, ocat, čep, papir",
        },
        time: { en: "15 min", hr: "15 min" },
        mess: 3,
      },
      {
        slug: { en: "make-popsicle-catapult", hr: "katapult-od-stapica-za-sladoled" },
        cover: {
          en: "/images/posts/How-to-make-Popsicle-Catapult-Cover-Picture.jpg",
          hr: "/images/posts/How-to-make-Popsicle-Catapult-Cover-Picture.jpg",
        },
        icon: "🎯",
        name: { en: "Popsicle-stick catapult", hr: "Katapult od štapića" },
        blurb: {
          en: "Build it, then launch pom-poms across the lawn - a backyard physics tournament.",
          hr: "Izradite ga pa lansirajte pompone preko travnjaka - turnir iz fizike u dvorištu.",
        },
        materials: {
          en: "craft sticks, rubber bands, a bottle cap, pom-poms",
          hr: "štapići za sladoled, gumice, čep boce, pomponi",
        },
        time: { en: "20 min", hr: "20 min" },
        mess: 1,
      },
      {
        slug: { en: "gummy-bears-osmosis-experiment", hr: "demonstracija-osmoze" },
        cover: { en: "/images/posts/gummy-osmosis.jpg", hr: "/images/posts/gummy-osmosis.jpg" },
        icon: "🐻",
        name: { en: "Grow gummy bears in water", hr: "Rastite gumene bombone u vodi" },
        blurb: {
          en: "Leave gummy bears soaking and watch them balloon overnight - a tasty intro to osmosis.",
          hr: "Ostavite gumene bombone da se namaču preko noći i gledajte kako bujaju - slatki uvod u osmozu.",
        },
        materials: {
          en: "gummy bears, water, glasses",
          hr: "gumeni bomboni, voda, čaše",
        },
        time: { en: "5 min + overnight", hr: "5 min + preko noći" },
        mess: 1,
        indoor: true,
      },
      {
        slug: { en: "how-to-make-cipher-wheel", hr: "kako-napraviti-kotac-za-sifriranje" },
        cover: {
          en: "/images/posts/How-to-make-a-Cipher-Wheel.jpg",
          hr: "/images/posts/Kako-napraviti-Kotac-za-Sifriranje.jpg",
        },
        icon: "🗝️",
        name: { en: "Secret cipher wheel", hr: "Tajni kotač za šifriranje" },
        blurb: {
          en: "Make a decoder wheel and swap secret messages with summer-camp friends.",
          hr: "Napravite kotač za dešifriranje i razmjenjujte tajne poruke s prijateljima s ljetovanja.",
        },
        materials: {
          en: "card, a split-pin, scissors, a pen",
          hr: "tvrđi papir, rascjepka, škare, olovka",
        },
        time: { en: "20 min", hr: "20 min" },
        mess: 1,
        indoor: true,
      },
    ],
  },
  {
    key: "upper",
    color: "#1E88C7",
    icon: "💡",
    age: { en: "ages 9–12 · upper elementary", hr: "11–14 godina · viši razredi" },
    title: {
      en: "Master explorers - big-kid STEM",
      hr: "Veliki istraživači - pravi STEM izazovi",
    },
    activities: [
      {
        slug: { en: "how-to-make-projector-using-smartphone", hr: "kako-napraviti-projektor-za-mobitel" },
        cover: {
          en: "/images/posts/How-to-Make-a-Cardboard-Projector-using-Smartphone-and-Magnifying-Glass-Cover-Image.jpg",
          hr: "/images/posts/Kako-napraviti-projektor-pomocu-mobitela-kartonske-kutije-i-povecala-Pocetna-Slika.jpg",
        },
        icon: "🎬",
        name: { en: "Backyard movie projector", hr: "Kino projektor u dvorištu" },
        blurb: {
          en: "Turn a shoebox + smartphone into a projector for an outdoor movie night under the stars.",
          hr: "Pretvorite kutiju i mobitel u projektor za filmsku večer pod zvijezdama.",
        },
        materials: {
          en: "a shoebox, a magnifying glass, a smartphone, tape",
          hr: "kutija za cipele, povećalo, mobitel, ljepljiva traka",
        },
        time: { en: "30 min", hr: "30 min" },
        mess: 1,
      },
      {
        slug: { en: "how-to-make-potato-battery", hr: "kako-napraviti-bateriju-od-krumpira" },
        cover: {
          en: "/images/posts/How-to-Make-a-Potato-Battery-Cover-Image.jpg",
          hr: "/images/posts/Kako-napraviti-Bateriju-od-Krumpira-Pocetna-Slika-1.jpg",
        },
        icon: "🥔",
        name: { en: "Potato battery", hr: "Baterija od krumpira" },
        blurb: {
          en: "Power a small light from a potato - real electricity from the veggie drawer.",
          hr: "Upalite lampicu pomoću krumpira, to je prava struja iz povrća.",
        },
        materials: {
          en: "a potato, copper wire, a galvanised nail, wires, an LED",
          hr: "krumpir, bakrena žica, pocinčani čavao, žice, LED",
        },
        time: { en: "20 min", hr: "20 min" },
        mess: 1,
      },
      {
        slug: { en: "write-your-name-in-binary", hr: "napisi-svoje-ime-binarnim-kodom" },
        cover: { en: "/images/posts/binary-bracelet-cover.jpg", hr: "/images/posts/binary-bracelet-cover.jpg" },
        icon: "💻",
        name: { en: "Write your name in binary", hr: "Napišite ime binarnim kodom" },
        blurb: {
          en: "Decode how computers store letters, then string a binary-code name bracelet.",
          hr: "Otkrijte kako računala pohranjuju slova i izradite narukvicu s imenom u binarnom kodu.",
        },
        materials: {
          en: "string or pipe cleaners, pony beads in two colours",
          hr: "uzica ili žica za savijanje, perle u dvije boje",
        },
        time: { en: "25 min", hr: "25 min" },
        mess: 1,
        indoor: true,
      },
      {
        slug: { en: "make-sugar-crystals-stem-activity-kids", hr: "kako-napraviti-kristale-od-secera" },
        cover: {
          en: "/images/posts/How-to-make-Sugar-Crystals-Cover-Image.jpg",
          hr: "/images/posts/Kako-napraviti-kristale-od-secera-Pocetna-slika.jpg",
        },
        icon: "💎",
        name: { en: "Grow rock candy crystals", hr: "Uzgojite kristale šećera" },
        blurb: {
          en: "A week-long sugar-crystal experiment that ends in an edible, sparkly summer treat.",
          hr: "Tjedan dana dug pokus s kristalima šećera koji završava jestivim, svjetlucavim slatkišem.",
        },
        materials: {
          en: "sugar, water, a jar, string, a pencil",
          hr: "šećer, voda, staklenka, uzica, olovka",
        },
        time: { en: "15 min + 1 week", hr: "15 min + 1 tjedan" },
        mess: 1,
        indoor: true,
      },
    ],
  },
];

export const SUMMER_TIPS_COLOR = "#F25C7A";

export const summerTips: Tip[] = [
  {
    icon: "🫙",
    title: { en: "Beat “I'm bored” with a summer jar", hr: "Pobijedite dosadu ljetnom teglom" },
    body: {
      en: "Write each activity on a stick; when boredom strikes, they draw one. The choice is theirs, the calm is yours.",
      hr: "Napišite svaku aktivnost na štapić; kad dosada navali, dijete izvuče jedan. Njihov izbor, a vaš trenutak odmora.",
    },
  },
  {
    icon: "🪣",
    title: { en: "Embrace the mess - take it outside", hr: "Prihvatite nered - iznesite ga van" },
    body: {
      en: "Volcanoes, rockets and color splashes are a hose-down away from spotless when you run them in the yard.",
      hr: "Vulkani, rakete i prskanje bojama su super zabavni u dvorištu i u blizini vode.",
    },
  },
  {
    icon: "💬",
    title: { en: "Ask “what do you think will happen?”", hr: "Pitajte „što misliš da će se dogoditi?“" },
    body: {
      en: "One question turns a demo into real science. Let them guess, test and be wrong - that's the whole point.",
      hr: "Jedno pitanje pretvara pokus u pravu znanost. Neka nagađaju, testiraju i griješe - u tome je cijela poanta.",
    },
  },
  {
    icon: "📓",
    title: { en: "Keep a summer discovery journal", hr: "Vodite ljetni dnevnik otkrića" },
    body: {
      en: "A cheap notebook for drawings and “results” fights the summer slide and makes a keepsake by autumn.",
      hr: "Jeftina bilježnica za crteže i „rezultate“ čuva znanje tijekom ljeta i postaje uspomena za jesenske dane.",
    },
  },
  {
    icon: "☀️",
    title: { en: "Sun, water & safety first", hr: "Sunce, voda i sigurnost na prvom mjestu" },
    body: {
      en: "Shade, hats and grown-up supervision near water and anything that launches, fizzes or pops.",
      hr: "Hlad, šeširi i nadzor odrasle osobe blizu vode i svega što lansira, pjeni ili eksplodira.",
    },
  },
];

/** Curated indoor subset for the "rainy-day" section, in book order. */
export const rainyDayActivities: Activity[] = summerSections.flatMap((s) =>
  s.activities.filter((a) => a.indoor),
);
