import Image from "next/image";
import Link from "next/link";
import ResponsiveImage from "./ResponsiveImage";
import AdventCalendar, { type AdventDoorView } from "./AdventCalendar";
import { getAllPosts, type Post } from "@/lib/posts";
import { tools, TOOLS_SLUG } from "@/lib/tools";
import type { SeasonalLang } from "@/lib/seasonal";
import DOORS from "@/lib/advent-doors.json";

// Palette: pine green, cranberry, candle gold and warm snow white.
const PINE = "#14532D";
const NIGHT_PINE = "#0B2E24";
const CRANBERRY = "#9F1F35";
const GOLD = "#E9B949";
const SNOW = "#FBF7EE";

type Door = {
  day: number;
  icon: string;
  /** Post translationKey; the door only links once that post is published. */
  key?: string;
  /** Heading id inside the post (rehype-slug form), per language. */
  anchor?: Record<SeasonalLang, string>;
  /** Interactive tool key, for doors that open a tool instead of a post. */
  tool?: string;
  /** One string for both languages, or per language when it has words in it. */
  time: string | Record<SeasonalLang, string>;
  age: string;
  title: Record<SeasonalLang, string>;
  how: Record<SeasonalLang, string>;
};

/** One card in a collection section. `key` is a post translationKey;
 *  unpublished posts are skipped, so a card appears once its post is live. */
type ShelfItem = { key: string; twist: Record<SeasonalLang, string> };

type Shelf = {
  id: string;
  icon: string;
  copy: Record<SeasonalLang, { eyebrow: string; title: string; body: string }>;
  items: ShelfItem[];
};

const SHELVES: Shelf[] = [
  {
    id: "snow",
    icon: "❄️",
    copy: {
      en: {
        eyebrow: "Let it snow",
        title: "Snow & Ice",
        body: "Snow you can make at the kitchen table, snowflakes with the right number of arms, and a blizzard that falls in slow motion.",
      },
      hr: {
        eyebrow: "Neka padne snijeg",
        title: "Snijeg i led",
        body: "Snijeg koji možete napraviti za kuhinjskim stolom, pahulje s pravim brojem krakova i mećava koja pada usporeno.",
      },
    },
    items: [
      {
        key: "how-to-make-fake-snow",
        twist: {
          en: "Two ingredients, cool to the touch, and a snowman that fizzes away when you add vinegar.",
          hr: "Dva sastojka, hladan na dodir i snjegović koji se zapjeni i nestane kad dodate ocat.",
        },
      },
      {
        key: "how-to-make-paper-snowflakes",
        twist: {
          en: "Fold six arms like a real snowflake, and find out why nature never makes one with eight.",
          hr: "Presavijte šest krakova kao na pravoj pahulji i saznajte zašto priroda nikad ne napravi pahulju s osam.",
        },
      },
      {
        key: "how-to-make-a-snow-globe",
        twist: {
          en: "A slow-motion blizzard in a jar, plus a glycerin race to find the slowest snow.",
          hr: "Usporena mećava u staklenci i utrka s glicerinom: tko će imati najsporiji snijeg?",
        },
      },
      {
        key: "5-amazing-balloon-experiments",
        twist: {
          en: "Christmas extension: static electricity makes tissue-paper snowflakes jump and dance.",
          hr: "Božićni dodatak: statički elektricitet tjera pahuljice od tankog papira da skaču i plešu.",
        },
      },
      {
        key: "make-sugar-crystals-stem-activity-kids",
        twist: {
          en: "Christmas extension: grow sparkly crystal candy canes to hang on the tree.",
          hr: "Božićni dodatak: uzgojite blistave kristalne štapiće koje možete objesiti na bor.",
        },
      },
      {
        key: "make-lava-lamp",
        twist: {
          en: "Add white paint and silver glitter, and the lava lamp becomes a snowstorm in a jar.",
          hr: "Dodajte bijelu boju i srebrne šljokice i lava lampa postaje snježna oluja u staklenci.",
        },
      },
    ],
  },
  {
    id: "workshop",
    icon: "🎁",
    copy: {
      en: {
        eyebrow: "Make it, then gift it",
        title: "Santa's Workshop",
        body: "Ornaments, decorations and little presents children can make themselves, each with a bit of science folded in.",
      },
      hr: {
        eyebrow: "Napravite pa poklonite",
        title: "Djedova radionica",
        body: "Ukrasi, dekoracije i mali darovi koje djeca mogu napraviti sama, a u svakome se krije malo znanosti.",
      },
    },
    items: [
      {
        key: "salt-dough-ornaments",
        twist: {
          en: "Stars, hearts and handprints that last for years, and the reason salt stops them going mouldy.",
          hr: "Licitarska srca, zvijezde i otisci ruku koji traju godinama, i razlog zašto zbog soli ne pljesnive.",
        },
      },
      {
        key: "how-to-make-origami-house",
        twist: {
          en: "Christmas extension: fold a whole gingerbread village from brown paper.",
          hr: "Božićni dodatak: presavijte cijelo selo kućica od medenjaka od smeđeg papira.",
        },
      },
      {
        key: "make-christmas-reindeer-decoration",
        twist: {
          en: "Three cinnamon sticks make a reindeer that makes the whole room smell like Christmas.",
          hr: "Od tri štapića cimeta nastaje sob koji cijelu sobu ispuni mirisom Božića.",
        },
      },
      {
        key: "pinecone-christmas-tree",
        twist: {
          en: "Tiny trees from a winter walk, and a pinecone that opens and closes with the weather.",
          hr: "Mala drvca iz zimske šetnje i šišarka koja se otvara i zatvara ovisno o vremenu.",
        },
      },
      {
        key: "toilet-roll-christmas-tree",
        twist: {
          en: "A table-top tree from cardboard rolls, with a counting puzzle hiding in every row.",
          hr: "Stolno drvce od kartonskih rola, a u svakom redu krije se mala matematička zagonetka.",
        },
      },
      {
        key: "how-to-make-colored-rice",
        twist: {
          en: "Christmas extension: a red, green and gold sensory bin full of hidden jingle bells.",
          hr: "Božićni dodatak: crveno-zeleno-zlatna senzorna kutija puna skrivenih praporaca.",
        },
      },
    ],
  },
  {
    id: "engineering",
    icon: "⚡",
    copy: {
      en: {
        eyebrow: "Launch, light and decode",
        title: "Christmas Engineering",
        body: "Catapults, circuits and secret codes for children who would rather build the present than wrap it.",
      },
      hr: {
        eyebrow: "Lansirajte, upalite, dešifrirajte",
        title: "Božićno inženjerstvo",
        body: "Katapulti, strujni krugovi i tajne šifre za djecu koja bi radije sagradila dar nego ga zamotala.",
      },
    },
    items: [
      {
        key: "make-popsicle-catapult",
        twist: {
          en: "Christmas extension: a snowball catapult and a paper-cup snowman to knock down.",
          hr: "Božićni dodatak: katapult za grudve snijega i snjegović od papirnatih čaša koji treba srušiti.",
        },
      },
      {
        key: "heat-conduction-experiment",
        twist: {
          en: "Christmas extension: a hot chocolate spoon race. Metal, wood or plastic: which wins?",
          hr: "Božićni dodatak: utrka žličica u toploj čokoladi. Metal, drvo ili plastika: tko pobjeđuje?",
        },
      },
      {
        key: "how-to-make-potato-battery",
        twist: {
          en: "Push the LED through a paper star and light the top of your Christmas tree with potatoes.",
          hr: "Provucite LED žaruljicu kroz papirnatu zvijezdu i krumpirima upalite vrh svog božićnog drvca.",
        },
      },
      {
        key: "how-to-make-cipher-wheel",
        twist: {
          en: "Write a coded Secret Santa clue that tells someone where their present is hidden.",
          hr: "Napišite šifriranu poruku koja otkriva gdje je skriven nečiji dar.",
        },
      },
      {
        key: "mobius-strip-activity",
        twist: {
          en: "Cut red, green and gold Möbius loops into a garland full of surprises.",
          hr: "Izrežite crvene, zelene i zlatne Möbiusove vrpce u girlandu punu iznenađenja.",
        },
      },
      {
        key: "write-your-name-in-binary",
        twist: {
          en: "String your name in red and white beads: a 1 for every red, a 0 for every white.",
          hr: "Nanižite svoje ime u crvenim i bijelim perlicama: crvena za jedinicu, bijela za nulu.",
        },
      },
    ],
  },
];

const PACK_PDF: Record<SeasonalLang, string> = {
  en: "/downloads/stem-advent-calendar.pdf",
  hr: "/downloads/stem-adventski-kalendar.pdf",
};

/** Parenting article linked from the "For grown-ups" card (hidden until published). */
const PARENTS_KEY = "is-santa-real-how-to-tell-kids";

const COPY = {
  en: {
    eyebrow: "Christmas science lab",
    title: "The STEM Advent Calendar",
    lede: "24 days of fake snow, six-armed snowflakes, snow globes and ornaments. One small experiment behind every door, from 1 December to Christmas Eve.",
    primaryCta: "Open the calendar ↓",
    secondaryCta: "Get the printable ↓",
    intro: <>Every door hides a hands-on activity you can do with things from the kitchen, the craft box and the recycling bin. Weekdays are short (10 to 20 minutes), and the bigger projects, like baking ornaments and making snow globes, fall on weekends. <strong>Every door has real science inside</strong>: chemistry, physics, maths and a little engineering.</>,
    calendarTitle: "Open a door",
    shelvesTitle: "All the Christmas experiments",
    packEyebrow: "Free 4-page printable",
    packTitle: "The STEM Advent Calendar",
    packBody: "Stick it on the fridge and let your child colour in a door each day. The second page has every day's mini instructions, so you can plan the week and gather materials in advance.",
    packItems: ["24-door calendar to colour in", "Checklist with every day's instructions", "Six-fold snowflake guide + 3 templates", "8 gift tags with the science inside"],
    packFile: "4-page A4 PDF · 1 MB",
    download: "↓ Download free",
    noSignup: "No email or sign-up",
    parentsTitle: "For grown-ups: \"Is Santa real?\"",
    parentsBody: "When children usually work it out, how they feel about it, and gentle ways to answer the big question.",
    parentsCta: "Read the guide →",
    waitTitle: "Why waiting is good for children",
    waitBody: [
      "Advent is a month of waiting, and that is a gift in itself. Psychologists have found that looking forward to something nice can bring as much joy as the event itself.",
      "Waiting is also a skill that grows with age and practice. Young children wait more easily when the wait has a shape: one small thing to do each day, a door to open, a box to tick. That is exactly what an advent calendar gives them.",
      "Count the doors that are left together, let your child do the ticking, and talk about what they are looking forward to.",
    ],
    rulesTitle: "Workshop rules",
    rules: [
      "A grown-up stays in the workshop for every experiment.",
      "Hot jobs (the oven, hot syrup, hot chocolate, glue guns) belong to grown-ups.",
      "Beads, glitter, jingle bells and other small parts are not for children under 3.",
      "Only taste what is food. Fake snow and salt dough are for hands, not mouths.",
    ],
    closing: "Behind every door there is a question worth asking. Happy experimenting, and Merry Christmas!",
  },
  hr: {
    eyebrow: "Božićni znanstveni laboratorij",
    title: "STEM adventski kalendar",
    lede: "24 dana umjetnog snijega, pahulja sa šest krakova, snježnih kugli i ukrasa. Iza svakih vrata čeka mali pokus, od 1. prosinca do Badnjaka.",
    primaryCta: "Otvorite kalendar ↓",
    secondaryCta: "Preuzmite za ispis ↓",
    intro: <>Iza svakih vrata krije se aktivnost koju možete napraviti s onim što imate u kuhinji, kutiji za kreativne radove i u otpadu za recikliranje. Radnim danima aktivnosti su kratke (10 do 20 minuta), a veći projekti, poput pečenja ukrasa i izrade snježnih kugli, padaju vikendom. <strong>Iza svakih vrata krije se prava znanost</strong>: kemija, fizika, matematika i malo inženjerstva.</>,
    calendarTitle: "Otvorite vrata",
    shelvesTitle: "Svi božićni pokusi",
    packEyebrow: "Besplatno, 4 stranice za ispis",
    packTitle: "STEM adventski kalendar",
    packBody: "Zalijepite ga na hladnjak i neka dijete svaki dan oboji jedna vrata. Na drugoj stranici su kratke upute za svaki dan, pa možete unaprijed isplanirati tjedan i pripremiti materijale.",
    packItems: ["Kalendar s 24 vrata za bojanje", "Popis s uputama za svaki dan", "Vodič za pahulje sa šest krakova + 3 predloška", "8 privjesaka za darove sa znanošću"],
    packFile: "4 stranice A4 · 1 MB",
    download: "↓ Besplatno preuzmite",
    noSignup: "Bez e-pošte i registracije",
    parentsTitle: "Za odrasle: \"Postoji li Djed Božićnjak?\"",
    parentsBody: "Kada djeca obično sama otkriju istinu, kako se pritom osjećaju i kako nježno odgovoriti na veliko pitanje.",
    parentsCta: "Pročitajte vodič →",
    waitTitle: "Zašto je čekanje dobro za djecu",
    waitBody: [
      "Advent je mjesec čekanja, a i samo čekanje je dar. Psiholozi su otkrili da radovanje nečemu lijepom može donijeti jednako mnogo sreće kao i sam događaj.",
      "Čekanje je i vještina koja raste s dobi i vježbom. Maloj djeci lakše je čekati kad čekanje ima oblik: jednu malu stvar svaki dan, vrata koja treba otvoriti, kvadratić koji treba označiti. Upravo to im daje adventski kalendar.",
      "Zajedno brojite koliko je vrata ostalo, neka dijete samo označava dane i razgovarajte o tome čemu se veseli.",
    ],
    rulesTitle: "Pravila radionice",
    rules: [
      "Odrasla osoba ostaje u radionici tijekom svakog pokusa.",
      "Vrući poslovi (pećnica, vrući sirup, topla čokolada, pištolj za vruće ljepilo) su za odrasle.",
      "Perlice, šljokice, praporci i drugi sitni dijelovi nisu za djecu mlađu od 3 godine.",
      "Kušajte samo ono što je hrana. Umjetni snijeg i slano tijesto su za ruke, ne za usta.",
    ],
    closing: "Iza svakih vrata krije se pitanje vrijedno postavljanja. Sretno eksperimentiranje i sretan Božić!",
  },
} satisfies Record<SeasonalLang, Record<string, unknown>>;

function ShelfCard({ post, item, lang }: { post: Post; item: ShelfItem; lang: SeasonalLang }) {
  return (
    <Link
      href={`/${lang}/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-44 w-full overflow-hidden bg-[#0B2E24]">
        {post.cover ? (
          <ResponsiveImage
            image={post.cover}
            alt={post.heroAlt || post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            maxWidth={1200}
            className="object-cover transition-transform duration-300 motion-safe:[@media(hover:hover)]:group-hover:scale-105"
          />
        ) : (
          <Image
            src={post.coverImage || "/images/placeholder.svg"}
            alt={post.heroAlt || post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-bold leading-snug text-gray-900 group-hover:text-[#9F1F35]">{post.title}</h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-gray-600">{item.twist[lang]}</p>
      </div>
    </Link>
  );
}

function publishedByKey(lang: SeasonalLang) {
  return new Map(getAllPosts(lang).map((p) => [p.translationKey, p]));
}

/** Doors with their links resolved for one language. A door whose post
 *  isn't published yet keeps its text but loses the link. */
function resolveDoors(lang: SeasonalLang): AdventDoorView[] {
  const byKey = publishedByKey(lang);
  return (DOORS as Door[]).map((door) => {
    let href: string | null = null;
    if (door.key) {
      const post = byKey.get(door.key);
      if (post) href = `/${lang}/${post.slug}${door.anchor ? `#${door.anchor[lang]}` : ""}`;
    } else if (door.tool) {
      const tool = tools.find((t) => t.key === door.tool);
      if (tool) href = `/${lang}/${TOOLS_SLUG[lang]}/${tool.slug[lang]}`;
    }
    const time = typeof door.time === "string" ? door.time : door.time[lang];
    return { day: door.day, icon: door.icon, title: door.title[lang], how: door.how[lang], time, age: door.age, href };
  });
}

/** Shelves with only their PUBLISHED posts, empty shelves dropped. */
function resolveShelves(lang: SeasonalLang) {
  const byKey = publishedByKey(lang);
  return SHELVES.map((s) => ({
    ...s,
    cards: s.items.flatMap((item) => {
      const post = byKey.get(item.key);
      return post ? [{ item, post }] : [];
    }),
  })).filter((s) => s.cards.length > 0);
}

/** Published posts in page order, for the CollectionPage JSON-LD. */
export function getAdventPosts(lang: SeasonalLang): Post[] {
  return resolveShelves(lang).flatMap((s) => s.cards.map((card) => card.post));
}

export default function AdventLanding({ lang }: { lang: SeasonalLang }) {
  const c = COPY[lang];
  const doors = resolveDoors(lang);
  const shelves = resolveShelves(lang);
  const parentsPost = getAllPosts(lang).find((p) => p.translationKey === PARENTS_KEY);

  return (
    <div>
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10 sm:py-14"
        style={{ background: `linear-gradient(150deg, ${NIGHT_PINE} 0%, ${PINE} 58%, #1F6B45 100%)` }}
      >
        <span
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.7) 1px, transparent 1.6px)", backgroundSize: "30px 30px" }}
          aria-hidden="true"
        />
        <div className="relative grid items-center gap-8 sm:grid-cols-[1fr_220px]">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-wide" style={{ color: GOLD }}>
              {c.eyebrow}
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl" style={{ color: SNOW }}>
              {c.title}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#E3F1E7]">{c.lede}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#calendar"
                className="rounded-full px-6 py-3 font-sans text-sm font-semibold text-[#0B2E24] transition-transform hover:scale-[1.03]"
                style={{ background: GOLD }}
              >
                {c.primaryCta}
              </a>
              <a
                href="#printable"
                className="rounded-full border border-white/40 px-6 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {c.secondaryCta}
              </a>
            </div>
          </div>

          {/* A little stack of advent doors under a glowing star. Decorative. */}
          <div className="relative mx-auto h-36 w-44 sm:h-52 sm:w-52" aria-hidden="true">
            <div
              className="absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rounded-full sm:h-20 sm:w-20"
              style={{ background: "radial-gradient(circle, rgba(233,185,73,.55) 0%, rgba(233,185,73,0) 70%)" }}
            />
            <span className="absolute left-1/2 top-2 -translate-x-1/2 text-4xl sm:text-5xl">⭐</span>
            <div className="absolute inset-x-3 bottom-0 grid grid-cols-3 gap-1.5 sm:inset-x-4 sm:gap-2">
              {[24, 6, 13, 1, 19, 8].map((n, i) => (
                <span
                  key={n}
                  className="flex aspect-square items-center justify-center rounded-lg font-sans text-base font-bold sm:text-lg"
                  style={{ background: i % 2 ? CRANBERRY : "#1F6B45", boxShadow: "inset 0 0 0 2px rgba(255,255,255,.18)" }}
                >
                  {n}
                </span>
              ))}
            </div>
            <span className="absolute left-0 top-10 text-2xl motion-safe:animate-[drift_8s_ease-in-out_infinite]">❄️</span>
            <span className="absolute right-0 top-16 text-xl motion-safe:animate-[drift_9s_ease-in-out_infinite_1s]">❄️</span>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-9 max-w-3xl">
        <p className="text-lg leading-relaxed text-gray-700">{c.intro}</p>
      </section>

      <section id="calendar" className="mt-10 scroll-mt-20 rounded-3xl p-5 sm:p-8" style={{ background: SNOW }}>
        <h2 className="mb-5 text-2xl font-bold text-gray-900">
          <span aria-hidden="true">🗓️ </span>
          {c.calendarTitle}
        </h2>
        <AdventCalendar lang={lang} doors={doors} />
      </section>

      {shelves.length > 0 && <h2 className="mt-14 text-3xl font-bold text-gray-900">{c.shelvesTitle}</h2>}
      {shelves.map((shelf) => {
        const s = shelf.copy[lang];
        return (
          <section key={shelf.id} id={shelf.id} className="mt-10 scroll-mt-20">
            <p className="font-sans text-sm font-semibold uppercase tracking-wide" style={{ color: CRANBERRY }}>
              <span aria-hidden="true">{shelf.icon} </span>
              {s.eyebrow}
            </p>
            <h3 className="mt-2 text-2xl font-bold text-gray-900">{s.title}</h3>
            <p className="mt-2 max-w-3xl text-gray-600">{s.body}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shelf.cards.map(({ item, post }) => (
                <ShelfCard key={item.key} item={item} post={post} lang={lang} />
              ))}
            </div>
          </section>
        );
      })}

      <section id="printable" className="mt-14 scroll-mt-20 overflow-hidden rounded-3xl" style={{ background: PINE }}>
        <div className="grid items-center gap-8 p-6 sm:grid-cols-[1fr_230px] sm:p-9">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-wide" style={{ color: GOLD }}>{c.packEyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold" style={{ color: SNOW }}>{c.packTitle}</h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[#E3F1E7]">{c.packBody}</p>
            <div className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {c.packItems.map((item) => (
                <span key={item} className="flex items-start gap-2 text-sm text-[#E3F1E7]">
                  <span className="mt-0.5" style={{ color: GOLD }} aria-hidden="true">✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <div className="text-5xl" aria-hidden="true">🗓️</div>
            <p className="mt-3 font-sans text-sm font-bold text-gray-900">{c.packTitle}</p>
            <p className="mt-1 font-sans text-xs text-gray-500">{c.packFile}</p>
            <a
              id="advent-calendar"
              href={PACK_PDF[lang]}
              download
              data-analytics-event="resource_download"
              data-analytics-resource-id="advent-calendar"
              data-analytics-source="stem-advent-calendar"
              data-analytics-placement="download-card"
              data-analytics-lang={lang}
              className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-3 font-sans text-sm font-semibold text-[#0B2E24] transition hover:brightness-105"
              style={{ background: GOLD }}
            >
              {c.download}
            </a>
            <p className="mt-3 font-sans text-xs text-gray-400">{c.noSignup}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl p-6 sm:p-8" style={{ background: SNOW }}>
          <h2 className="text-2xl font-bold text-gray-900">
            <span aria-hidden="true">🕯️ </span>
            {c.waitTitle}
          </h2>
          {c.waitBody.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-[15px] leading-relaxed text-gray-700">{paragraph}</p>
          ))}
        </div>
        {parentsPost && (
          <Link
            href={`/${lang}/${parentsPost.slug}`}
            className="group flex flex-col justify-center gap-3 rounded-3xl bg-white p-6 ring-1 ring-black/5 transition hover:shadow-md sm:p-8"
          >
            <span className="text-4xl" aria-hidden="true">🎅</span>
            <span className="block text-2xl font-bold text-gray-900">{c.parentsTitle}</span>
            <span className="block text-[15px] leading-relaxed text-gray-600">{c.parentsBody}</span>
            <span className="font-sans text-sm font-semibold text-[#7A3E9D]">{c.parentsCta}</span>
          </Link>
        )}
      </section>

      <section className="mt-6 rounded-3xl p-6 text-white sm:p-8" style={{ background: NIGHT_PINE }}>
        <h2 className="text-2xl font-bold" style={{ color: SNOW }}>
          <span aria-hidden="true">🧤 </span>
          {c.rulesTitle}
        </h2>
        <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {c.rules.map((rule) => (
            <li key={rule} className="flex gap-2.5 text-[15px] leading-relaxed text-[#E3F1E7]">
              <span className="mt-0.5" style={{ color: GOLD }} aria-hidden="true">✦</span>
              {rule}
            </li>
          ))}
        </ul>
      </section>

      <p className="mx-auto mt-10 max-w-3xl text-center text-[16px] leading-relaxed text-gray-600">{c.closing}</p>
    </div>
  );
}
