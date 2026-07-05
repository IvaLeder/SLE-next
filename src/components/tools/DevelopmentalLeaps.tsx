"use client";

import { useState } from "react";

type Lang = "en" | "hr";

// The ten mental leaps of the first ~20 months. Weeks are counted from the
// due date (leaps track gestational age, not the birthday). `start`–`end` is
// the approximate fussy window during which the leap typically happens.
const LEAPS: { start: number; end: number }[] = [
  { start: 4, end: 6 },
  { start: 7, end: 9 },
  { start: 11, end: 13 },
  { start: 14, end: 19 },
  { start: 22, end: 26 },
  { start: 33, end: 37 },
  { start: 41, end: 46 },
  { start: 50, end: 55 },
  { start: 59, end: 64 },
  { start: 70, end: 76 },
];

const COPY = {
  en: {
    modeDue: "Due date",
    modeBirth: "Birth date",
    dateLabel: { due: "Baby's due date", birth: "Baby's birth date" },
    dueNote:
      "Leaps follow gestational age, so they're counted from the due date — not the birthday.",
    birthNote:
      "Don't know the due date? Counting from birth works too, but if your baby came early or late, every leap shifts by the same amount.",
    intro:
      "Around each leap your baby's brain takes a big developmental step and the world suddenly looks different. That's why fussy phases — more crying, clinginess and crankiness — often show up right before a new skill does.",
    weeksOld: (w: number) =>
      `Your baby is about ${w} ${w === 1 ? "week" : "weeks"} old on this count.`,
    inLeap: (n: number) => `Leap ${n} is likely in full swing right now.`,
    beforeFirst: (date: string) => `Leap 1 is expected around ${date}.`,
    nextLeap: (n: number, date: string, days: number) =>
      `Next up: leap ${n}, expected around ${date} (in about ${days} ${days === 1 ? "day" : "days"}).`,
    allDone: "All 10 leaps are behind you — smoother sailing ahead! 🎉",
    leapLabel: (n: number) => `Leap ${n}`,
    weeks: (a: number, b: number) => `Weeks ${a}–${b}`,
    statusNow: "Happening now",
    statusNext: "Next up",
    statusDone: "Done",
    disclaimer:
      "Every baby is different — leap timing is a guide, not a schedule. If anything about your baby's development worries you, talk to your pediatrician.",
    leaps: [
      {
        name: "New sensations",
        expect:
          "The world suddenly feels more intense. Expect extra crying and cuddling, then a more alert baby and the first real smiles.",
      },
      {
        name: "Patterns",
        expect:
          "Your baby starts spotting simple patterns: staring at their own hands, lights and shadows, and listening closely to sounds.",
      },
      {
        name: "Smooth transitions",
        expect:
          "Movements and sounds get smoother — fluid eye tracking, squealing, gurgling and much more purposeful reaching.",
      },
      {
        name: "Events",
        expect:
          "Short sequences start to make sense: your baby shakes, bangs, grabs and mouths everything within reach.",
      },
      {
        name: "Distance & relationships",
        expect:
          "Baby now understands distance — including that you can walk away. Separation anxiety often starts around this leap.",
      },
      {
        name: "Categories",
        expect:
          "Everything gets examined and compared as your baby starts sorting the world into groups — a dog is not a cat!",
      },
      {
        name: "Sequences",
        expect:
          "Steps get chained together: stacking blocks, fitting shapes, pointing at things to hear their names.",
      },
      {
        name: "Programs",
        expect:
          "Everyday routines click into place — your toddler “helps” with dressing, cooking and cleaning, and imitates everything.",
      },
      {
        name: "Principles",
        expect:
          "Meet your little planner: strategies appear, rules and boundaries get tested, and the first tantrums may arrive.",
      },
      {
        name: "Systems",
        expect:
          "The big picture forms — me and you, mine and yours — along with the first signs of empathy and conscience.",
      },
    ],
  },
  hr: {
    modeDue: "Termin poroda",
    modeBirth: "Datum rođenja",
    dateLabel: { due: "Termin poroda", birth: "Datum rođenja bebe" },
    dueNote:
      "Skokovi prate gestacijsku dob, pa se računaju od termina poroda — ne od rođendana.",
    birthNote:
      "Ne znate termin? Može i od datuma rođenja, ali ako je beba stigla ranije ili kasnije, svi se skokovi pomiču za jednako toliko.",
    intro:
      "Oko svakog skoka bebin mozak napravi velik razvojni korak i svijet odjednom izgleda drukčije. Zato se plačljive faze — više plača, maženja i mrzovolje — često pojave neposredno prije nove vještine.",
    weeksOld: (w: number) =>
      `Po ovom računu vaša beba ima otprilike ${w} ${w === 1 ? "tjedan" : w < 5 ? "tjedna" : "tjedana"}.`,
    inLeap: (n: number) => `${n}. skok je vjerojatno upravo u punom jeku.`,
    beforeFirst: (date: string) => `Prvi skok očekujte oko ${date}.`,
    nextLeap: (n: number, date: string, days: number) =>
      `Slijedi ${n}. skok, očekujte ga oko ${date} (za otprilike ${days} ${days === 1 ? "dan" : "dana"}).`,
    allDone: "Svih 10 skokova je iza vas — slijede mirnije vode! 🎉",
    leapLabel: (n: number) => `${n}. skok`,
    weeks: (a: number, b: number) => `${a}.–${b}. tjedan`,
    statusNow: "Upravo traje",
    statusNext: "Slijedi",
    statusDone: "Prošao",
    disclaimer:
      "Svaka je beba drukčija — vrijeme skokova je orijentir, a ne raspored. Ako vas išta u razvoju vaše bebe brine, obratite se pedijatru.",
    leaps: [
      {
        name: "Nove senzacije",
        expect:
          "Svijet odjednom postaje intenzivniji. Očekujte više plača i maženja, a zatim budniju bebu i prve prave osmijehe.",
      },
      {
        name: "Uzorci",
        expect:
          "Beba počinje uočavati jednostavne uzorke: zuri u svoje ručice, svjetla i sjene te pozorno sluša zvukove.",
      },
      {
        name: "Glatki prijelazi",
        expect:
          "Pokreti i glasanje postaju tečniji — glatko praćenje pogledom, cika, gukanje i sve spretnije posezanje.",
      },
      {
        name: "Događaji",
        expect:
          "Kratki slijedovi dobivaju smisao: beba trese, lupa, grabi i stavlja u usta sve što dohvati.",
      },
      {
        name: "Udaljenost i odnosi",
        expect:
          "Beba sada razumije udaljenost — pa i to da vi možete otići. Oko ovog skoka često počinje separacijski strah.",
      },
      {
        name: "Kategorije",
        expect:
          "Sve se proučava i uspoređuje dok beba počinje svrstavati svijet u skupine — pas nije mačka!",
      },
      {
        name: "Slijedovi",
        expect:
          "Koraci se povezuju u cjeline: slaganje kocaka, umetanje oblika, pokazivanje prstićem da čuje kako se što zove.",
      },
      {
        name: "Programi",
        expect:
          "Svakodnevne rutine sjedaju na mjesto — dijete „pomaže“ pri oblačenju, kuhanju i pospremanju te sve oponaša.",
      },
      {
        name: "Načela",
        expect:
          "Upoznajte malog planera: pojavljuju se strategije, testiraju se pravila i granice, a mogu stići i prvi ispadi bijesa.",
      },
      {
        name: "Sustavi",
        expect:
          "Slaže se šira slika — ja i ti, moje i tvoje — uz prve znakove empatije i savjesti.",
      },
    ],
  },
} as const;

const DAY = 24 * 60 * 60 * 1000;

// Parse the <input type="date"> value as local midnight (new Date("YYYY-MM-DD")
// would give UTC midnight and can land on the previous local day).
function parseLocal(value: string): Date | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export default function DevelopmentalLeaps({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const locale = lang === "hr" ? "hr-HR" : "en-US";
  const [mode, setMode] = useState<"due" | "birth">("due");
  const [value, setValue] = useState("");

  const base = value ? parseLocal(value) : null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Round: both dates are local midnights, but a DST change between them makes
  // the difference off by ±1h, so flooring would drop or add a whole day.
  const ageDays = base ? Math.round((today.getTime() - base.getTime()) / DAY) : null;

  const fmt = (d: Date) =>
    d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const leapDates = base
    ? LEAPS.map((l) => ({
        from: new Date(base.getTime() + l.start * 7 * DAY),
        to: new Date(base.getTime() + (l.end * 7 + 6) * DAY),
      }))
    : null;

  // Index of the leap happening now, and of the first one still ahead.
  const currentIdx =
    ageDays === null
      ? -1
      : LEAPS.findIndex((l) => ageDays >= l.start * 7 && ageDays <= l.end * 7 + 6);
  const nextIdx =
    ageDays === null ? -1 : LEAPS.findIndex((l) => ageDays < l.start * 7);

  let summary: string | null = null;
  if (base && leapDates && ageDays !== null) {
    if (currentIdx >= 0) summary = t.inLeap(currentIdx + 1);
    else if (nextIdx === 0) summary = t.beforeFirst(fmt(leapDates[0].from));
    else if (nextIdx > 0)
      summary = t.nextLeap(
        nextIdx + 1,
        fmt(leapDates[nextIdx].from),
        Math.round((leapDates[nextIdx].from.getTime() - today.getTime()) / DAY),
      );
    else summary = t.allDone;
  }

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <p className="text-sm leading-relaxed text-gray-600">{t.intro}</p>

      <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-3">
        <div>
          <div className="flex gap-1" role="group">
            {(["due", "birth"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  mode === m ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {m === "due" ? t.modeDue : t.modeBirth}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-600">
            {t.dateLabel[mode]}
          </span>
          <input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-900 focus:border-brand focus:outline-none"
          />
        </label>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-gray-400">
        {mode === "due" ? t.dueNote : t.birthNote}
      </p>

      {summary && (
        <div role="status" className="mt-4 rounded-xl bg-orange-50 p-4">
          <p className="font-semibold text-gray-800">{summary}</p>
          {ageDays !== null && ageDays >= 0 && (
            <p className="mt-1 text-sm text-gray-600">{t.weeksOld(Math.floor(ageDays / 7))}</p>
          )}
        </div>
      )}

      <ol className="mt-6 space-y-3">
        {LEAPS.map((l, i) => {
          const isNow = i === currentIdx;
          const isNext = currentIdx < 0 && i === nextIdx;
          const isDone = ageDays !== null && ageDays > l.end * 7 + 6;
          return (
            <li
              key={i}
              className={`rounded-xl border p-4 transition-colors ${
                isNow
                  ? "border-brand bg-orange-50"
                  : isNext
                    ? "border-brand/40 bg-orange-50/50"
                    : isDone
                      ? "border-gray-100 bg-gray-50 opacity-70"
                      : "border-gray-100"
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                  className={`text-sm font-bold ${isNow || isNext ? "text-brand" : "text-gray-400"}`}
                >
                  {t.leapLabel(i + 1)}
                </span>
                <span className="font-semibold text-gray-900">{t.leaps[i].name}</span>
                <span className="text-xs text-gray-500">
                  {t.weeks(l.start, l.end)}
                  {leapDates && (
                    <> · {fmt(leapDates[i].from)} – {fmt(leapDates[i].to)}</>
                  )}
                </span>
                {(isNow || isNext || isDone) && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isNow
                        ? "bg-brand text-white"
                        : isNext
                          ? "bg-orange-100 text-brand"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isNow ? t.statusNow : isNext ? t.statusNext : t.statusDone}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{t.leaps[i].expect}</p>
            </li>
          );
        })}
      </ol>

      <p className="mt-5 text-xs leading-relaxed text-gray-400">{t.disclaimer}</p>
    </div>
  );
}
