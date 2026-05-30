"use client";

export type FilterChip<T extends string | null = string> = {
  key: T;
  label: string;
  /** Optional leading glyph (e.g. a subject emoji) shown before the label. */
  icon?: string;
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
  // min-h-[44px] meets the WCAG / Apple HIG 44×44 px touch-target minimum.
  // inline-flex + items-center centres the label inside the larger hit area
  // without making the chip look visually bigger.
  const btnBase     = "inline-flex items-center gap-1.5 min-h-[44px] px-4 py-1.5 rounded-full text-sm font-medium font-sans transition-colors border";
  const btnActive   = "bg-brand text-white border-brand";
  const btnInactive = "bg-white text-gray-700 border-gray-200 hover:bg-brand-soft hover:border-brand-ring hover:text-brand";

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
          {chip.icon && (
            <span aria-hidden="true" className="text-base leading-none">
              {chip.icon}
            </span>
          )}
          {chip.label}
        </button>
      ))}
    </div>
  );
}
