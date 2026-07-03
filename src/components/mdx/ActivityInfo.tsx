import { type Lang } from "@/lib/affiliate";

const COPY = {
  en: {
    age: "Age",
    time: "Time",
    difficulty: "Difficulty",
    mess: "Mess level",
    supervision: "Supervision",
    yes: "Yes",
    no: "No",
  },
  hr: {
    age: "Dob",
    time: "Trajanje",
    difficulty: "Zahtjevnost",
    mess: "Nered",
    supervision: "Nadzor",
    yes: "Da",
    no: "Ne",
  },
} as const;

interface ActivityInfoProps {
  lang?: Lang;
  /** e.g. "4–8" (years) */
  age?: string;
  /** e.g. "20 min" */
  time?: string;
  /** free-form, e.g. "Easy" / "Lako" */
  difficulty?: string;
  /** free-form, e.g. "High — do it outside!" */
  mess?: string;
  /** "yes" / "no" are localized; anything else shows as-is */
  supervision?: string;
}

/**
 * At-a-glance facts strip for the top of an activity/experiment post: age
 * range, duration, difficulty, mess level, supervision. All props optional —
 * only the ones provided render. Values are free-form strings written in the
 * article's language (each MDX file is single-language already).
 *
 * Deliberately a <section>, not <aside>: print styles hide every <aside>, and
 * parents who print instructions want these facts on paper.
 */
export default function ActivityInfo({
  lang = "en",
  age,
  time,
  difficulty,
  mess,
  supervision,
}: ActivityInfoProps) {
  const t = COPY[lang];

  const supervisionValue =
    supervision?.toLowerCase() === "yes"
      ? t.yes
      : supervision?.toLowerCase() === "no"
        ? t.no
        : supervision;

  const items = [
    { icon: "🎂", label: t.age, value: age },
    { icon: "⏱️", label: t.time, value: time },
    { icon: "🎯", label: t.difficulty, value: difficulty },
    { icon: "🧹", label: t.mess, value: mess },
    { icon: "👀", label: t.supervision, value: supervisionValue },
  ].filter((item) => item.value);

  if (items.length === 0) return null;

  return (
    <section className="not-prose my-8 rounded-2xl border border-brand-soft bg-brand-soft/50 p-4 font-sans print:border-gray-300">
      <ul className="flex flex-wrap gap-2">
        {items.map(({ icon, label, value }) => (
          <li
            key={label}
            className="flex items-center gap-1.5 rounded-full border border-white bg-white/80 px-3 py-1.5 text-sm shadow-sm print:border-gray-200 print:shadow-none"
          >
            <span aria-hidden="true">{icon}</span>
            <span className="text-gray-500">{label}:</span>
            <span className="font-semibold text-gray-800">{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
