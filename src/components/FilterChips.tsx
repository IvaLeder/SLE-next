"use client";

export type FilterChip<T extends string | null = string> = {
  key: T;
  label: string;
};

type Props<T extends string | null = string> = {
  chips: FilterChip<T>[];
  /** Currently-selected key. Pass `null` for the "all" pseudo-chip. */
  active: T | null;
  onChange: (key: T | null) => void;
  /** Localised label for the "all/show everything" chip rendered first. */
  allLabel: string;
  /** Optional ARIA label for the chip group (e.g. "Filter by subject"). */
  ariaLabel?: string;
};

/**
 * Pill-shaped filter chips used by PostList and ActivitiesClient.
 * Includes a built-in "All" chip that sets the active value to null.
 */
export default function FilterChips<T extends string>({
  chips,
  active,
  onChange,
  allLabel,
  ariaLabel,
}: Props<T>) {
  const btnBase     = "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border";
  const btnActive   = "bg-indigo-600 text-white border-indigo-600";
  const btnInactive = "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600";

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`${btnBase} ${active === null ? btnActive : btnInactive}`}
        aria-pressed={active === null}
      >
        {allLabel}
      </button>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(active === chip.key ? null : chip.key)}
          className={`${btnBase} ${active === chip.key ? btnActive : btnInactive}`}
          aria-pressed={active === chip.key}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
