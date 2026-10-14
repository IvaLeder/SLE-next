import Image from "next/image";
import Link from "next/link";
import ResponsiveImage from "./ResponsiveImage";
import { getAllPosts, type Post } from "@/lib/posts";
import type { SeasonalLang } from "@/lib/seasonal";

// Palette: night violet, pumpkin orange, near-black. Kept more violet than the
// Mind Explorers plum so the two brands don't blur.
const NIGHT = "#17121F";
const VIOLET = "#2B1B45";
const PUMPKIN = "#E8771E";
const CREAM = "#FFF6E9";

type Level = 1 | 2 | 3;

/** One card in the lab. `key` is a post translationKey; unpublished posts
 *  (drafts, or not written yet) are skipped, so a card appears on its own
 *  as soon as its article is published. */
type LabItem = { key: string; level: Level; twist: Record<SeasonalLang, string> };

type LabSection = {
  id: string;
  icon: string;
  copy: Record<SeasonalLang, { eyebrow: string; title: string; body: string }>;
  items: LabItem[];
};

const SECTIONS: LabSection[] = [
  {
    id: "goo",
    icon: "🧪",
    copy: {
      en: {
        eyebrow: "Bubble, bubble",
        title: "Goo & Potions",
        body: "Squishy, stretchy and fizzy. Each one shows how ordinary kitchen ingredients can behave in surprising ways.",
      },
      hr: {
        eyebrow: "Bućkanje u kotliću",
        title: "Sluz i napici",
        body: "Gnjecavo, rastezljivo i pjenušavo. Svaki pokus pokazuje kako se obični sastojci iz kuhinje mogu ponašati iznenađujuće.",
      },
    },
    items: [
      {
        key: "how-to-make-slime",
        level: 2,
        twist: {
          en: "Six recipes, five without borax: ghost slime, monster snot, frog-spawn potion and more.",
          hr: "Šest recepata, pet bez boraksa: sluz duh, čudovišni šmrklji, žablji mrijest i još.",
        },
      },
      {
        key: "how-to-make-oobleck",
        level: 2,
        twist: {
          en: "Zombie goo that turns solid when you punch it and melts when you stop.",
          hr: "Zombi-sluz koja se stvrdne kad je udarite, a rastopi se kad stanete.",
        },
      },
      {
        key: "red-cabbage-ph-indicator-potions",
        level: 1,
        twist: {
          en: "Witch's potions that turn pink, purple, blue and green with a single drop.",
          hr: "Vještičji napici koji od jedne kapi postanu ružičasti, ljubičasti, plavi ili zeleni.",
        },
      },
      {
        key: "how-to-make-homemade-volcano",
        level: 1,
        twist: {
          en: "Make it a bubbling cauldron: a black pot, green foam and a few plastic spiders.",
          hr: "Pretvorite ga u kotlić koji kipi: crni lonac, zelena pjena i nekoliko plastičnih pauka.",
        },
      },
      {
        key: "make-colorful-milk-polarity-experiment",
        level: 1,
        twist: {
          en: "Drag the bursting colours into a spider web with a toothpick.",
          hr: "Čačkalicom razvucite boje u paukovu mrežu.",
        },
      },
      {
        key: "make-lava-lamp",
        level: 1,
        twist: {
          en: "Mix an orange and purple potion bottle full of rising, glowing blobs.",
          hr: "Napravite narančasto-ljubičastu bočicu napitka punu mjehurića koji se dižu.",
        },
      },
      {
        key: "make-homemade-playdough-learn-science",
        level: 1,
        twist: {
          en: "Knead pumpkin orange and midnight black, then sculpt friendly little monsters.",
          hr: "Zamijesite narančastu boju bundeve i ponoćnu crnu pa oblikujte mala, prijateljska čudovišta.",
        },
      },
    ],
  },
  {
    id: "autumn",
    icon: "🍂",
    copy: {
      en: {
        eyebrow: "Just outside the window",
        title: "Autumn Science",
        body: "Falling leaves, browning apples and the first frosty morning all have a scientific story behind them.",
      },
      hr: {
        eyebrow: "Odmah ispred prozora",
        title: "Jesenska znanost",
        body: "Lišće koje pada, jabuke koje smeđe i prvo mrazno jutro, sve to ima znanstvenu priču.",
      },
    },
    items: [
      {
        key: "why-leaves-change-color",
        level: 1,
        twist: {
          en: "Where the green goes in autumn, and the colours that were hiding underneath all summer.",
          hr: "Kamo nestaje zelena boja u jesen i koje su se boje skrivale ispod nje cijelo ljeto.",
        },
      },
      {
        key: "ice-melting-experiment-frozen-spiders",
        level: 2,
        twist: {
          en: "Free spiders trapped in an ice cave with salt and warm water, and learn why we salt winter roads.",
          hr: "Solju i toplom vodom oslobodite pauke zarobljene u ledenoj špilji i saznajte zašto zimi solimo ceste.",
        },
      },
      {
        key: "apple-oxidation",
        level: 1,
        twist: {
          en: "Why a bitten apple turns brown, and which kitchen trick slows it down.",
          hr: "Zašto zagrižena jabuka posmeđi i koji ga kuhinjski trik usporava.",
        },
      },
      {
        key: "how-to-make-colored-rice",
        level: 1,
        twist: {
          en: "Dye it orange, purple and black for an autumn sensory bin.",
          hr: "Obojite je u narančasto, ljubičasto i crno za jesensku senzornu kutiju.",
        },
      },
      {
        key: "homemade-sensory-bottle-child-sensory-development",
        level: 1,
        twist: {
          en: "Fill one with tiny leaves, acorns and gold glitter for a calm autumn bottle.",
          hr: "Napunite je sitnim lišćem, žirevima i zlatnim šljokicama za mirnu jesensku bočicu.",
        },
      },
      {
        key: "make-sugar-crystals-stem-activity-kids",
        level: 1,
        twist: {
          en: "Grow sparkly crystals that look like the first frost on the grass.",
          hr: "Uzgojite blistave kristale nalik prvom inju na travi.",
        },
      },
    ],
  },
  {
    id: "night",
    icon: "🌙",
    copy: {
      en: {
        eyebrow: "When the evenings get long",
        title: "Night & Glow",
        body: "Autumn brings early darkness. Use it for shadows, glowing eggs and a little candlelit mystery.",
      },
      hr: {
        eyebrow: "Kad večeri postanu duge",
        title: "Noć i sjaj",
        body: "Jesen donosi rani mrak. Iskoristite ga za sjene, jaja koja svijetle i malo misterije uz svijeću.",
      },
    },
    items: [
      {
        key: "egg-in-vinegar-make-bouncy-glowing-egg",
        level: 2,
        twist: {
          en: "Turn the naked egg into a glowing monster eyeball with a torch.",
          hr: "Pretvorite golo jaje u svjetleće čudovišno oko uz pomoć baterijske svjetiljke.",
        },
      },
      {
        key: "moon-phases-for-kids",
        level: 1,
        twist: {
          en: "Track the moon through October, all the way to a full moon.",
          hr: "Pratite Mjesec kroz listopad, sve do punog Mjeseca.",
        },
      },
      {
        key: "how-to-make-projector-using-smartphone",
        level: 1,
        twist: {
          en: "Project shadow stories onto the wall on a dark evening.",
          hr: "Projicirajte priče sa sjenama na zid u mračnu večer.",
        },
      },
      {
        key: "candle-in-the-vacuum-experiment",
        level: 1,
        twist: {
          en: "A candle, a glass and water that mysteriously climbs upward.",
          hr: "Svijeća, čaša i voda koja se tajanstveno penje.",
        },
      },
    ],
  },
];

const PACK_PDF: Record<SeasonalLang, string> = {
  en: "/downloads/pumpkins-and-potions-lab-pack.pdf",
  hr: "/downloads/bundeve-i-napici-laboratorij.pdf",
};

/** Parenting article linked from the "For grown-ups" card (hidden until published). */
const PARENTS_KEY = "childhood-fears-by-age";

const COPY = {
  en: {
    eyebrow: "Autumn science lab",
    title: "Pumpkins & Potions",
    lede: "Gooey slime, bubbling cauldrons and glowing eyeballs, plus the real science of autumn. Friendly experiments with kitchen ingredients, rated by how spooky they get.",
    primaryCta: "Start with the goo ↓",
    secondaryCta: "How spooky is it? ↓",
    intro: <>Autumn is a season of change: the leaves turn, the evenings grow dark and pumpkins appear on doorsteps. This lab collects our favourite experiments for the season. Some are a little bit spooky, none are scary, and <strong>every one has real science inside</strong>: polymers, acids and bases, light and shadow.</>,
    meterTitle: "The spook-o-meter",
    levels: [
      ["Cute", "Pumpkins, potions and colours. Nothing scary at all."],
      ["Mildly gross", "Goo, eyeballs and monster snot. Giggles guaranteed."],
      ["A bit creepy", "Bones and spiders, but still friendly."],
    ],
    levelLabel: (n: number) => `Spooky level ${n} of 3`,
    rulesTitle: "Lab rules",
    rules: [
      "An adult stays in the lab for every experiment.",
      "Googly eyes, plastic spiders and other small parts are not for children under 3.",
      "Potions are for looking at, not drinking, unless the recipe says taste-safe.",
      "Wash hands when the experiment is over.",
    ],
    comingTitle: "Brewing next",
    coming: ["Witch's colour-changing potions", "Rescue the frozen spiders", "Why leaves change colour"],
    packEyebrow: "Free 4-page printable",
    packTitle: "The Pumpkins & Potions lab pack",
    packBody: "Print it, grab a pencil and turn the kitchen into a lab. Children record their guesses and results like real scientists.",
    packItems: ["Potion lab with a pH rainbow", "Slime and oobleck tests", "Autumn colour hunt", "Spider rescue race", "10 cut-out potion labels"],
    packFile: "4-page A4 PDF · 652 KB",
    download: "↓ Download free",
    noSignup: "No email or sign-up",
    parentsTitle: "For grown-ups: is your child scared?",
    parentsBody: "Masks, the dark, monsters under the bed: which fears are normal at each age, and gentle ways to help.",
    parentsCta: "Read the guide →",
    closing: "Behind every spooky effect there is a question worth asking. Happy experimenting!",
  },
  hr: {
    eyebrow: "Jesenski znanstveni laboratorij",
    title: "Bundeve i čarobni napici",
    lede: "Ljepljiva sluz, kotlići koji kipe i oči koje svijetle, uz pravu znanost jeseni. Prijateljski pokusi sa sastojcima iz kuhinje, označeni prema tome koliko su strašni.",
    primaryCta: "Počnite sa sluzi ↓",
    secondaryCta: "Koliko je strašno? ↓",
    intro: <>Jesen je godišnje doba promjena: lišće mijenja boju, večeri postaju tamne, a na pragovima se pojavljuju bundeve. U ovom laboratoriju skupili smo omiljene pokuse za ovo doba godine. Neki su pomalo sablasni, nijedan nije strašan, a <strong>u svakome se krije prava znanost</strong>: polimeri, kiseline i lužine, svjetlost i sjena.</>,
    meterTitle: "Strašnometar",
    levels: [
      ["Slatko", "Bundeve, napici i boje. Ništa strašno."],
      ["Malo fuj", "Sluz, oči i čudovišni šmrklji. Smijeh zajamčen."],
      ["Pomalo jezivo", "Kosti i pauci, ali i dalje prijateljski."],
    ],
    levelLabel: (n: number) => `Razina strašnosti ${n} od 3`,
    rulesTitle: "Pravila laboratorija",
    rules: [
      "Odrasla osoba ostaje u laboratoriju tijekom svakog pokusa.",
      "Oči za lutke, plastični pauci i drugi sitni dijelovi nisu za djecu mlađu od 3 godine.",
      "Napici su za gledanje, ne za piće, osim ako recept kaže da su jestivi.",
      "Nakon pokusa operite ruke.",
    ],
    comingTitle: "Uskoro u kotliću",
    coming: ["Vještičji napici koji mijenjaju boju", "Spasite zaleđene pauke", "Zašto lišće mijenja boju"],
    packEyebrow: "Besplatan paket od 4 stranice",
    packTitle: "Laboratorijski paket Bundeve i čarobni napici",
    packBody: "Ispišite ga, uzmite olovku i pretvorite kuhinju u laboratorij. Djeca bilježe pretpostavke i rezultate kao pravi znanstvenici.",
    packItems: ["Laboratorij napitaka s pH dugom", "Testovi sluzi i oobleka", "Jesenski lov na boje", "Utrka spašavanja pauka", "10 etiketa za napitke"],
    packFile: "4 stranice A4 · 655 KB",
    download: "↓ Besplatno preuzmite",
    noSignup: "Bez e-pošte i registracije",
    parentsTitle: "Za odrasle: boji li se vaše dijete?",
    parentsBody: "Maske, mrak, čudovišta ispod kreveta: koji su strahovi uobičajeni u kojoj dobi i kako nježno pomoći.",
    parentsCta: "Pročitajte vodič →",
    closing: "Iza svakog sablasnog efekta krije se pitanje vrijedno postavljanja. Sretno eksperimentiranje!",
  },
} satisfies Record<SeasonalLang, Record<string, unknown>>;

function Pumpkins({ level, label }: { level: Level; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-sm leading-none" role="img" aria-label={label} title={label}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= level ? "" : "opacity-25 grayscale"} aria-hidden="true">🎃</span>
      ))}
    </span>
  );
}

function LabCard({ post, item, lang }: { post: Post; item: LabItem; lang: SeasonalLang }) {
  const c = COPY[lang];
  return (
    <Link
      href={`/${lang}/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-44 w-full overflow-hidden bg-[#2B1B45]">
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
        <Pumpkins level={item.level} label={c.levelLabel(item.level)} />
        <h3 className="mt-2 font-serif text-lg font-bold leading-snug text-gray-900 group-hover:text-[#7A3E9D]">
          {post.title}
        </h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-gray-600">{item.twist[lang]}</p>
      </div>
    </Link>
  );
}

/** Sections with only their PUBLISHED posts, empty sections dropped. */
function resolveSections(lang: SeasonalLang) {
  const byKey = new Map(getAllPosts(lang).map((p) => [p.translationKey, p]));
  return SECTIONS.map((s) => ({
    ...s,
    cards: s.items.flatMap((item) => {
      const post = byKey.get(item.key);
      return post ? [{ item, post }] : [];
    }),
  })).filter((s) => s.cards.length > 0);
}

/** Published posts in page order, for the CollectionPage JSON-LD. */
export function getPumpkinsPosts(lang: SeasonalLang): Post[] {
  return resolveSections(lang).flatMap((s) => s.cards.map((card) => card.post));
}

export default function PumpkinsLanding({ lang }: { lang: SeasonalLang }) {
  const c = COPY[lang];
  const sections = resolveSections(lang);
  const parentsPost = getAllPosts(lang).find((p) => p.translationKey === PARENTS_KEY);

  return (
    <div>
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10 sm:py-14"
        style={{ background: `linear-gradient(150deg, ${NIGHT} 0%, ${VIOLET} 55%, #4A2463 100%)` }}
      >
        <span
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{ backgroundImage: "radial-gradient(rgba(255,230,190,.5) 1px, transparent 1.5px)", backgroundSize: "34px 34px" }}
          aria-hidden="true"
        />
        <div className="relative grid items-center gap-8 sm:grid-cols-[1fr_220px]">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-wide" style={{ color: "#F7B267" }}>
              {c.eyebrow}
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl" style={{ color: CREAM }}>
              {c.title}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#E9DDF7]">{c.lede}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={`#${sections[0]?.id ?? "goo"}`}
                className="rounded-full px-6 py-3 font-sans text-sm font-semibold text-[#17121F] transition-transform hover:scale-[1.03]"
                style={{ background: PUMPKIN }}
              >
                {c.primaryCta}
              </a>
              <a
                href="#spook-o-meter"
                className="rounded-full border border-white/40 px-6 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {c.secondaryCta}
              </a>
            </div>
          </div>

          {/* Harvest moon with a few drifting autumn things. Decorative. */}
          <div className="relative mx-auto h-32 w-40 sm:h-52 sm:w-52" aria-hidden="true">
            <div
              className="absolute inset-y-2 inset-x-6 rounded-full sm:inset-6"
              style={{
                background: "radial-gradient(circle at 38% 35%, #FFD9A0 0%, #F4A04A 45%, #D9661A 100%)",
                boxShadow: "0 0 60px 12px rgba(244,160,74,.35)",
              }}
            />
            <span className="absolute left-1 top-3 text-3xl motion-safe:animate-[drift_7s_ease-in-out_infinite]">🦇</span>
            <span className="absolute right-0 top-14 text-2xl motion-safe:animate-[drift_9s_ease-in-out_infinite_1s]">🍂</span>
            <span className="absolute bottom-6 left-4 text-2xl motion-safe:animate-[drift_8s_ease-in-out_infinite_2s]">🍁</span>
            <span className="absolute -bottom-1 right-6 text-5xl">🎃</span>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-9 max-w-3xl">
        <p className="text-lg leading-relaxed text-gray-700">{c.intro}</p>
      </section>

      <section id="spook-o-meter" className="mt-10 scroll-mt-20 rounded-3xl p-6 sm:p-8" style={{ background: CREAM }}>
        <h2 className="text-2xl font-bold text-gray-900">{c.meterTitle}</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {c.levels.map(([name, body], index) => (
            <li key={name} className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <Pumpkins level={(index + 1) as Level} label={c.levelLabel(index + 1)} />
              <p className="mt-2 font-sans font-bold text-gray-900">{name}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {sections.map((section) => {
        const s = section.copy[lang];
        return (
          <section key={section.id} id={section.id} className="mt-14 scroll-mt-20">
            <p className="font-sans text-sm font-semibold uppercase tracking-wide" style={{ color: "#B4561A" }}>
              <span aria-hidden="true">{section.icon} </span>
              {s.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">{s.title}</h2>
            <p className="mt-2 max-w-3xl text-gray-600">{s.body}</p>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {section.cards.map(({ item, post }) => (
                <LabCard key={item.key} item={item} post={post} lang={lang} />
              ))}
            </div>
          </section>
        );
      })}

      <section id="lab-pack" className="mt-14 scroll-mt-20 overflow-hidden rounded-3xl" style={{ background: VIOLET }}>
        <div className="grid items-center gap-8 p-6 sm:grid-cols-[1fr_230px] sm:p-9">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-wide" style={{ color: "#F7B267" }}>{c.packEyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold" style={{ color: CREAM }}>{c.packTitle}</h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[#E9DDF7]">{c.packBody}</p>
            <div className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {c.packItems.map((item) => (
                <span key={item} className="flex items-start gap-2 text-sm text-[#E9DDF7]">
                  <span className="mt-0.5" style={{ color: "#F7B267" }} aria-hidden="true">✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <div className="text-5xl" aria-hidden="true">🧪</div>
            <p className="mt-3 font-sans text-sm font-bold text-gray-900">{c.packTitle}</p>
            <p className="mt-1 font-sans text-xs text-gray-500">{c.packFile}</p>
            <a
              id="potion-lab-pack"
              href={PACK_PDF[lang]}
              download
              data-analytics-event="resource_download"
              data-analytics-resource-id="potion-lab-pack"
              data-analytics-source="pumpkins-and-potions"
              data-analytics-placement="download-card"
              data-analytics-lang={lang}
              className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-3 font-sans text-sm font-semibold text-[#17121F] transition hover:brightness-105"
              style={{ background: PUMPKIN }}
            >
              {c.download}
            </a>
            <p className="mt-3 font-sans text-xs text-gray-400">{c.noSignup}</p>
          </div>
        </div>
      </section>

      {parentsPost && (
        <Link
          href={`/${lang}/${parentsPost.slug}`}
          className="group mt-6 flex flex-wrap items-center gap-4 rounded-3xl p-6 ring-1 ring-black/5 transition hover:shadow-md sm:flex-nowrap sm:p-8"
          style={{ background: CREAM }}
        >
          <span className="text-4xl" aria-hidden="true">🕯️</span>
          <span className="min-w-0 flex-1">
            <span className="block text-xl font-bold text-gray-900">{c.parentsTitle}</span>
            <span className="mt-1 block text-[15px] leading-relaxed text-gray-600">{c.parentsBody}</span>
          </span>
          <span className="font-sans text-sm font-semibold" style={{ color: "#7A3E9D" }}>{c.parentsCta}</span>
        </Link>
      )}

      <section className="mt-14 grid gap-5 sm:grid-cols-2">
        <div className="rounded-3xl p-6 text-white sm:p-8" style={{ background: VIOLET }}>
          <h2 className="text-2xl font-bold" style={{ color: CREAM }}>
            <span aria-hidden="true">🧙 </span>
            {c.rulesTitle}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {c.rules.map((rule) => (
              <li key={rule} className="flex gap-2.5 text-[15px] leading-relaxed text-[#E9DDF7]">
                <span className="mt-0.5" style={{ color: "#F7B267" }} aria-hidden="true">✦</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border-2 border-dashed p-6 sm:p-8" style={{ borderColor: "#F2C79A", background: "#FFFBF5" }}>
          <h2 className="text-2xl font-bold text-gray-900">
            <span aria-hidden="true">🫧 </span>
            {c.comingTitle}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {c.coming.map((title) => (
              <li key={title} className="flex gap-2.5 text-[15px] text-gray-700">
                <span style={{ color: PUMPKIN }} aria-hidden="true">●</span>
                {title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="mx-auto mt-10 max-w-3xl text-center text-[16px] leading-relaxed text-gray-600">{c.closing}</p>
    </div>
  );
}
