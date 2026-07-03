"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

type Lang = "en" | "hr";

const COPY = {
  en: { title: "Milestones", of: "of", reset: "Reset" },
  hr: { title: "Prekretnice", of: "od", reset: "Poništi" },
} as const;

/** Stable per-item storage key derived from the milestone's own text, so
 *  reordering items doesn't shuffle saved checkmarks. Editing an item's text
 *  unchecks it — acceptable. */
function slugify(node: React.ReactNode): string {
  const text = (function extract(n: React.ReactNode): string {
    if (n == null || typeof n === "boolean") return "";
    if (typeof n === "string" || typeof n === "number") return String(n);
    if (Array.isArray(n)) return n.map(extract).join(" ");
    if (React.isValidElement<{ children?: React.ReactNode }>(n))
      return extract(n.props.children);
    return "";
  })(node);
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/* localStorage as an external store: hydration-safe (server snapshot is
 * null → first client render matches SSR), and the custom event keeps
 * multiple checklists / tabs in sync. */
const UPDATE_EVENT = "milestones-updated";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(UPDATE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(UPDATE_EVENT, cb);
  };
}

interface ChecklistCtx {
  checked: Record<string, boolean>;
  register: (key: string) => void;
  toggle: (key: string) => void;
}

const Ctx = createContext<ChecklistCtx | null>(null);

interface MilestoneChecklistProps {
  lang?: Lang;
  /** Storage namespace, unique per article/section, e.g. id="baby-month-8".
   *  Checkmarks persist in this browser via localStorage. */
  id: string;
  title?: string;
  children: React.ReactNode;
}

/**
 * Interactive checklist for the baby month-by-month series:
 *
 *   <MilestoneChecklist id="baby-month-8">
 *   <Milestone>Sits without support</Milestone>
 *   <Milestone>Passes objects from hand to hand</Milestone>
 *   </MilestoneChecklist>
 *
 * Checked state is saved per-browser in localStorage (nothing leaves the
 * device). Deliberately printable — parents tick the boxes on paper.
 */
export default function MilestoneChecklist({
  lang = "en",
  id,
  title,
  children,
}: MilestoneChecklistProps) {
  const t = COPY[lang];
  const storageKey = `milestones:${id}`;

  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(storageKey);
      } catch {
        return null;
      }
    },
    () => null
  );

  const checked = useMemo<Record<string, boolean>>(() => {
    if (!raw) return {};
    try {
      return Object.fromEntries(
        (JSON.parse(raw) as string[]).map((k) => [k, true])
      );
    } catch {
      return {};
    }
  }, [raw]);

  const [keys, setKeys] = useState<string[]>([]);
  const register = useCallback((key: string) => {
    setKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const write = (next: string[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new Event(UPDATE_EVENT));
    } catch {
      /* private mode — persistence is best-effort */
    }
  };

  const toggle = (key: string) => {
    const current = Object.keys(checked).filter((k) => checked[k]);
    write(
      checked[key] ? current.filter((k) => k !== key) : [...current, key]
    );
  };

  const done = keys.filter((k) => checked[k]).length;

  return (
    <section className="not-prose my-8 rounded-2xl border border-brand-soft bg-white p-5 font-sans print:border-gray-300">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand">
          <span aria-hidden="true">🌱</span> {title ?? t.title}
        </p>
        <p className="text-sm font-medium tabular-nums text-gray-500">
          {done} {t.of} {keys.length}
          {done > 0 && (
            <button
              type="button"
              onClick={() => write([])}
              className="ml-3 text-xs font-semibold text-gray-400 underline hover:text-gray-600 print:hidden"
            >
              {t.reset}
            </button>
          )}
        </p>
      </div>

      <Ctx.Provider value={{ checked, register, toggle }}>
        <ul className="space-y-1">{children}</ul>
      </Ctx.Provider>
    </section>
  );
}

/** One item inside <MilestoneChecklist>. Children are the milestone text. */
export function Milestone({ children }: { children: React.ReactNode }) {
  const ctx = useContext(Ctx);
  const key = slugify(children) || "item";
  const isChecked = ctx?.checked[key] ?? false;

  const register = ctx?.register;
  useEffect(() => {
    register?.(key);
  }, [register, key]);

  return (
    <li>
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 text-[0.95rem] leading-relaxed transition ${
          isChecked ? "bg-green-50 text-gray-500" : "hover:bg-gray-50"
        }`}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => ctx?.toggle(key)}
          // localStorage is the source of truth — don't let browser
          // form-restore fight it on reload/back-nav
          autoComplete="off"
          className="mt-1 size-4 shrink-0 accent-brand"
        />
        <span>{children}</span>
      </label>
    </li>
  );
}
