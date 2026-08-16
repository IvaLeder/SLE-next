import Image from "next/image";
import Link from "next/link";
import { BACK_TO_SCHOOL_PDF, type BackToSchoolLang } from "@/lib/back-to-school";

const ASKA_PEEK_IMAGE = "/images/posts/aska-seven-day-peek.png";

type Resource = {
  href: string;
  icon: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  color: string;
  tint: string;
};

const START_HERE: Resource[] = [
  {
    href: "/en/school-readiness-beyond-letters-and-numbers",
    icon: "🧭",
    eyebrow: "Understand",
    title: "Is my child ready for school?",
    body:
      "Look beyond letters and numbers at cognitive, emotional, social, language, physical and executive-function readiness, without turning childhood into a test.",
    cta: "Explore school readiness",
    color: "#5B3F91",
    tint: "#F4EFFA",
  },
  {
    href: "/en/curious-and-calm-back-to-school",
    icon: "🌤️",
    eyebrow: "Prepare",
    title: "Build a curious and calm beginning",
    body:
      "Create predictable mornings, trustworthy goodbyes, gentle check-ins and an after-school landing strip that still works when everyone is tired.",
    cta: "Build the gentle plan",
    color: "#C84E68",
    tint: "#FFF0F3",
  },
  {
    href: "/en/how-to-learn-multiplication-tables",
    icon: "✖️",
    eyebrow: "Learn",
    title: "Make multiplication make sense",
    body:
      "Turn 100 apparent facts into a connected system using arrays, mirror facts, doubling, break-apart strategies and focused interactive practice.",
    cta: "Learn the multiplication shortcuts",
    color: "#3F62A8",
    tint: "#EEF4FF",
  },
];

const MORE_SUPPORT: Resource[] = [
  {
    href: "/en/improve-childs-working-memory",
    icon: "🧠",
    eyebrow: "Executive functions",
    title: "Support working memory",
    body: "Use chunking, visual cues and external supports when instructions keep disappearing halfway through.",
    cta: "Read the guide",
    color: "#5B3F91",
    tint: "#F4EFFA",
  },
  {
    href: "/en/learning-letters-for-preschoolers-activity",
    icon: "🔤",
    eyebrow: "Early learning",
    title: "Play with letters and numbers",
    body: "Seven hands-on activities for early literacy and number familiarity, without turning home into another classroom.",
    cta: "Try the activities",
    color: "#C84E68",
    tint: "#FFF0F3",
  },
  {
    href: "/en/activities-for-matching-patterns",
    icon: "🧩",
    eyebrow: "Patterns",
    title: "Notice what comes next",
    body: "Build the observation and prediction skills underneath reading, mathematics and everyday routines.",
    cta: "Explore patterns",
    color: "#0F766E",
    tint: "#ECFDF9",
  },
  {
    href: "/en/make-cardboard-clock-learn-tell-time",
    icon: "🕐",
    eyebrow: "Time",
    title: "Make time visible",
    body: "Build a cardboard clock, move the hands and connect an abstract school-day schedule to something a child can see.",
    cta: "Make the clock",
    color: "#B56618",
    tint: "#FFF7E8",
  },
];

const START_HERE_HR: Resource[] = [
  {
    href: "/hr/spremnost-za-skolu-vise-od-slova-i-brojeva",
    icon: "🧭",
    eyebrow: "Razumijte",
    title: "Je li moje dijete spremno za školu?",
    body:
      "Pogledajte dalje od slova i brojeva: kognitivnu, emocionalnu, socijalnu, jezičnu i tjelesnu spremnost te izvršne funkcije, bez pretvaranja djetinjstva u test.",
    cta: "Istražite spremnost za školu",
    color: "#5B3F91",
    tint: "#F4EFFA",
  },
  {
    href: "/hr/znatizeljno-i-mirno-povratak-u-skolu",
    icon: "🌤️",
    eyebrow: "Pripremite",
    title: "Izgradite znatiželjan i miran početak",
    body:
      "Stvorite predvidljiva jutra, pouzdane rastanke, nježne provjere osjećaja i miran dolazak kući koji funkcionira i kad su svi umorni.",
    cta: "Složite nježan plan",
    color: "#C84E68",
    tint: "#FFF0F3",
  },
  {
    href: "/hr/kako-nauciti-tablicu-mnozenja",
    icon: "✖️",
    eyebrow: "Učite",
    title: "Neka množenje ima smisla",
    body:
      "Pretvorite 100 prividno nepovezanih činjenica u sustav uz polja točaka, zrcalne parove, udvostručavanje, rastavljanje i ciljanu interaktivnu vježbu.",
    cta: "Otkrijte prečace za množenje",
    color: "#3F62A8",
    tint: "#EEF4FF",
  },
];

const MORE_SUPPORT_HR: Resource[] = [
  {
    href: "/hr/kako-poboljsati-radno-pamcenje-vaseg-djeteta",
    icon: "🧠",
    eyebrow: "Izvršne funkcije",
    title: "Podržite radno pamćenje",
    body: "Upotrijebite grupiranje, vizualne znakove i vanjske podsjetnike kad upute nestanu na pola zadatka.",
    cta: "Pročitajte vodič",
    color: "#5B3F91",
    tint: "#F4EFFA",
  },
  {
    href: "/hr/aktivnost-ucenja-slova-kod-predskolaca",
    icon: "🔤",
    eyebrow: "Rano učenje",
    title: "Igrajte se slovima i brojevima",
    body: "Sedam praktičnih aktivnosti za ranu pismenost i razumijevanje brojeva, bez pretvaranja doma u još jednu učionicu.",
    cta: "Isprobajte aktivnosti",
    color: "#C84E68",
    tint: "#FFF0F3",
  },
  {
    href: "/hr/zabavne-aktivnosti-s-nizovima",
    icon: "🧩",
    eyebrow: "Uzorci",
    title: "Primijetite što slijedi",
    body: "Razvijajte opažanje i predviđanje, vještine koje se nalaze ispod čitanja, matematike i svakodnevnih rutina.",
    cta: "Istražite uzorke",
    color: "#0F766E",
    tint: "#ECFDF9",
  },
  {
    href: "/hr/kako-napraviti-sat-od-kartona-pomocu-njega-uciti-na-sat",
    icon: "🕐",
    eyebrow: "Vrijeme",
    title: "Učinite vrijeme vidljivim",
    body: "Napravite kartonski sat, pomičite kazaljke i povežite apstraktni školski raspored s nečim što dijete može vidjeti.",
    cta: "Napravite sat",
    color: "#B56618",
    tint: "#FFF7E8",
  },
];

const COPY = {
  en: {
    eyebrow: "Back-to-school guide for families and educators",
    title: "Curious, calm and ready to learn",
    lede: "A gentler start to school: understand readiness, build routines that carry some of the thinking, make room for big feelings and help learning feel possible.",
    primaryCta: "Start with the gentle plan →",
    secondaryCta: "See the free printable ↓",
    cardTitle: "A gentle start",
    cardSteps: ["Connect", "Make it visible", "Practise", "Recover"],
    intro: <>Back to school is not only a stationery list. A child is also meeting new expectations, people, sensory demands, transitions and learning challenges. This hub brings the most useful pieces together in one place: <strong>what readiness really means, how to support regulation and routines, and how to teach a difficult skill without losing curiosity</strong>.</>,
    pathEyebrow: "A simple path through the transition",
    pathTitle: "Understand, prepare, then learn",
    pathBody: "Start where the current question is. The three guides work together, but each one stands on its own.",
    printableEyebrow: "Free 8-page printable",
    printableTitle: "The Curious and Calm school starter kit",
    printableBody: "Print the pieces you need, not another checklist to complete perfectly. Children can point, circle, draw or talk while adults use the pages to move memory and planning out of a busy brain and onto paper.",
    printableItems: ["Readiness portrait", "School-day story", "Visual morning routine", "After-school landing strip", "Three-minute feelings check-in", "Worry-to-plan sheet", "Five-day curiosity challenge"],
    kitLabel: "School starter kit",
    kitFile: "8-page A4 PDF · 533 KB",
    download: "↓ Download free",
    noSignup: "No email or sign-up",
    supportEyebrow: "Keep supporting the foundations",
    supportTitle: "Small tools for the school year",
    supportBody: "These existing guides support the skills underneath classroom work: holding instructions in mind, noticing patterns, making sense of time and approaching symbols through play.",
    weekEyebrow: "One week, one small step at a time",
    weekTitle: "A seven-day gentle start",
    week: [
      ["Notice", "Ask what feels exciting, confusing or unknown. Listen before solving."],
      ["Make it knowable", "Walk the route, find the door and tell a short, honest school-day story."],
      ["Make it visible", "Put four to six morning steps where the child can see and use them."],
      ["Practise help", "Rehearse one useful phrase: “I don’t understand” or “Can you help me?”"],
      ["Plan the landing", "Choose the predictable snack, quiet, movement or connection that comes after school."],
      ["Learn lightly", "Use ten calm minutes for one interesting skill, then stop while attention is still good."],
      ["Leave space", "Prepare the bag and clothes, then protect time for play, rest and connection."],
    ],
    closing: "School readiness is not a finish line a child crosses alone. It grows when children, families and schools make the next step understandable, supported and possible.",
  },
  hr: {
    eyebrow: "Vodič za početak škole za obitelji i odgojno-obrazovne djelatnike",
    title: "Znatiželjno, mirno i spremno za učenje",
    lede: "Nježniji početak škole: razumijte spremnost, izgradite rutine koje preuzimaju dio razmišljanja, ostavite mjesta velikim osjećajima i pomozite da učenje bude moguće.",
    primaryCta: "Počnite lagano →",
    secondaryCta: "Pogledajte besplatan paket ↓",
    cardTitle: "Nježan početak",
    cardSteps: ["Povežite se", "Učinite vidljivim", "Vježbajte", "Oporavite se"],
    intro: <>Povratak u školu nije samo popis pribora. Dijete susreće i nova očekivanja, ljude, osjetilne zahtjeve, prijelaze i izazove u učenju. Ovaj hub na jednom mjestu povezuje najkorisnije dijelove: <strong>što spremnost doista znači, kako podržati regulaciju i rutine te kako poučavati zahtjevnu vještinu bez gubitka znatiželje</strong>.</>,
    pathEyebrow: "Jednostavan put kroz prijelaze",
    pathTitle: "Razumijte, pripremite se, zatim učite",
    pathBody: "Počnite od pitanja koje vam je sada najvažnije. Tri članka djeluju zajedno, ali svaki se može čitati zasebno.",
    printableEyebrow: "Besplatan paket od 8 stranica",
    printableTitle: "Paket Znatiželjno i mirno za početak škole",
    printableBody: "Ispišite dijelove koji vam trebaju, a ne još jedan popis koji treba savršeno ispuniti. Djeca mogu pokazati, zaokružiti, crtati ili razgovarati.",
    printableItems: ["Slika spremnosti", "Priča o školskom danu", "Slikovna jutarnja rutina", "Zona slijetanja nakon škole", "Trominutna provjera osjećaja", "Od brige do maloga plana", "Petodnevni izazov znatiželje"],
    kitLabel: "Paket za početak škole",
    kitFile: "8 stranica A4 · 538 KB",
    download: "↓ Besplatno preuzmite",
    noSignup: "Bez e-pošte i registracije",
    supportEyebrow: "Nastavite podržavati temelje",
    supportTitle: "Mali alati za školsku godinu",
    supportBody: "Ovi članci podržavaju vještine u podlozi svih školskih zadataka: zadržavanje uputa u umu, primjećivanje uzoraka, razumijevanje vremena i upoznavanje simbola kroz igru.",
    weekEyebrow: "Jedan tjedan, jedan mali korak",
    weekTitle: "Sedam dana za lagani početak",
    week: [
      ["Primijetite", "Pitajte što djeluje uzbudljivo, zbunjujuće ili nepoznato. Slušajte prije rješavanja."],
      ["Učinite poznatijim", "Prođite put, pronađite vrata i ispričajte kratku, iskrenu priču o školskom danu."],
      ["Učinite vidljivim", "Postavite četiri do šest jutarnjih koraka ondje gdje ih dijete može vidjeti i koristiti."],
      ["Vježbajte traženje pomoći", "Uvježbajte jednu korisnu rečenicu: „Ne razumijem” ili „Možete li mi pomoći?”"],
      ["Planirajte slijetanje", "Odaberite predvidljiv međuobrok, tišinu, kretanje ili povezanost nakon škole."],
      ["Učite lagano", "Odvojite deset mirnih minuta za jednu zanimljivu vještinu i stanite dok pažnja još traje."],
      ["Ostavite prostora", "Pripremite torbu i odjeću, a zatim zaštitite vrijeme za igru, odmor i povezanost."],
    ],
    closing: "Spremnost za školu nije ciljna crta koju dijete prelazi samo. Raste kad djeca, obitelji i škole sljedeći korak učine razumljivim, podržanim i mogućim.",
  },
} satisfies Record<BackToSchoolLang, Record<string, unknown>>;

function ResourceCard({ resource, featured = false }: { resource: Resource; featured?: boolean }) {
  return (
    <Link
      href={resource.href}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        featured ? "p-6" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
          style={{ background: resource.tint }}
          aria-hidden="true"
        >
          {resource.icon}
        </span>
        <span
          className="rounded-full px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-wide"
          style={{ background: resource.tint, color: resource.color }}
        >
          {resource.eyebrow}
        </span>
      </div>
      <h3 className={`${featured ? "mt-5 text-2xl" : "mt-4 text-xl"} font-bold leading-tight text-gray-900`}>
        {resource.title}
      </h3>
      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-gray-600">{resource.body}</p>
      <span className="mt-5 font-sans text-sm font-semibold" style={{ color: resource.color }}>
        {resource.cta} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}

export default function BackToSchoolLanding({ lang }: { lang: BackToSchoolLang }) {
  const c = COPY[lang];
  const startHere = lang === "hr" ? START_HERE_HR : START_HERE;
  const moreSupport = lang === "hr" ? MORE_SUPPORT_HR : MORE_SUPPORT;
  const gentlePlanHref = lang === "hr"
    ? "/hr/znatizeljno-i-mirno-povratak-u-skolu"
    : "/en/curious-and-calm-back-to-school";

  return (
    <div>
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-10 text-white sm:px-10 sm:py-12"
        style={{ background: "linear-gradient(135deg, #312E81 0%, #5744A0 52%, #A74375 100%)" }}
      >
        <span
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="relative grid items-center gap-8 sm:grid-cols-[1fr_220px]">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-wide text-indigo-200">
              {c.eyebrow}
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
              {c.title}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-indigo-100">
              {c.lede}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={gentlePlanHref}
                className="rounded-full bg-white px-6 py-3 font-sans text-sm font-semibold text-indigo-800 transition-transform hover:scale-[1.03]"
              >
                {c.primaryCta}
              </Link>
              <a
                href="#school-kit"
                className="rounded-full border border-white/40 px-6 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {c.secondaryCta}
              </a>
            </div>
          </div>

          <div className="relative mx-auto h-52 w-48" aria-hidden="true">
            <div className="absolute left-5 top-3 h-44 w-36 rotate-6 rounded-xl bg-[#F9C74F] shadow-xl" />
            <div className="absolute left-0 top-5 h-44 w-36 -rotate-6 rounded-xl bg-[#FB6F52] shadow-xl" />
            <div className="absolute left-3 top-0 h-44 w-36 rounded-xl bg-white p-4 text-indigo-900 shadow-2xl">
              <div className="border-b-2 border-indigo-100 pb-2 font-sans text-sm font-bold">{c.cardTitle}</div>
              <div className="mt-3 space-y-2.5">
                {c.cardSteps.map((word, index) => (
                  <div key={word} className="flex items-center gap-2 font-sans text-xs font-semibold">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] text-indigo-700">
                      {index + 1}
                    </span>
                    {word}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end text-2xl">✏️</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-9 max-w-3xl">
        <p className="text-lg leading-relaxed text-gray-700">
          {c.intro}
        </p>
      </section>

      <section className="mt-12">
        <p className="font-sans text-sm font-semibold uppercase tracking-wide text-indigo-600">{c.pathEyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold text-gray-900">{c.pathTitle}</h2>
        <p className="mt-2 max-w-3xl text-gray-600">
          {c.pathBody}
        </p>
        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {startHere.map((resource) => (
            <ResourceCard key={resource.href} resource={resource} featured />
          ))}
        </div>
      </section>

      <section
        id="school-kit"
        className="mt-12 scroll-mt-20 overflow-hidden rounded-3xl border border-indigo-100 bg-indigo-50"
      >
        <div className="grid items-center gap-8 p-6 sm:grid-cols-[1fr_230px] sm:p-9">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-wide text-indigo-600">{c.printableEyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">{c.printableTitle}</h2>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-gray-700">
              {c.printableBody}
            </p>
            <div className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {c.printableItems.map((item) => (
                <span key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 text-indigo-500" aria-hidden="true">✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
            <div className="text-5xl" aria-hidden="true">📋</div>
            <p className="mt-3 font-sans text-sm font-bold text-gray-900">{c.kitLabel}</p>
            <p className="mt-1 font-sans text-xs text-gray-500">{c.kitFile}</p>
            <a
              id="curious-calm-school-kit"
              href={BACK_TO_SCHOOL_PDF[lang]}
              download
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 font-sans text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              {c.download}
            </a>
            <p className="mt-3 font-sans text-xs text-gray-400">{c.noSignup}</p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <p className="font-sans text-sm font-semibold uppercase tracking-wide text-indigo-600">{c.supportEyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold text-gray-900">{c.supportTitle}</h2>
        <p className="mt-2 max-w-3xl text-gray-600">
          {c.supportBody}
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {moreSupport.map((resource) => (
            <ResourceCard key={resource.href} resource={resource} />
          ))}
        </div>
      </section>

      <section className="relative mt-12 overflow-hidden rounded-3xl bg-gray-50 p-6 sm:p-9">
        <div className="relative z-10 max-w-[calc(100%-6rem)] sm:max-w-[calc(100%-10rem)]">
          <p className="font-sans text-sm font-semibold uppercase tracking-wide text-indigo-600">{c.weekEyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">{c.weekTitle}</h2>
        </div>
        <Image
          src={ASKA_PEEK_IMAGE}
          alt=""
          width={420}
          height={420}
          sizes="(max-width: 639px) 96px, 160px"
          className="pointer-events-none absolute right-2 top-1 h-auto w-24 sm:right-7 sm:-top-12 sm:w-40"
          aria-hidden="true"
        />
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {c.week.map(([title, body], index) => (
            <li key={title} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-gray-100">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-sans text-sm font-bold text-indigo-700">
                {index + 1}
              </span>
              <span>
                <strong className="font-sans text-gray-900">{title}</strong>
                <span className="mt-0.5 block text-sm leading-relaxed text-gray-600">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mx-auto mt-9 max-w-3xl text-center text-[16px] leading-relaxed text-gray-600">
        {c.closing}
      </p>
    </div>
  );
}
