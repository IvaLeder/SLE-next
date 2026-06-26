"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Search from "./Search";
import { TOOLS_SLUG } from "@/lib/tools";

type HeaderProps = {
  lang: "en" | "hr";
  switchUrl?: string;
};

const SUBJECTS = {
  en: [
    { href: "/en/category/science", label: "Science" },
    { href: "/en/category/engineering", label: "Engineering" },
    { href: "/en/category/math", label: "Math" },
    { href: "/en/category/technology", label: "Technology" },
    { href: "/en/category/psychology", label: "Psychology" },
  ],
  hr: [
    { href: "/hr/category/science", label: "Znanost" },
    { href: "/hr/category/engineering", label: "Inženjerstvo" },
    { href: "/hr/category/math", label: "Matematika" },
    { href: "/hr/category/technology", label: "Tehnologija" },
    { href: "/hr/category/psychology", label: "Psihologija" },
  ],
};

export default function Header({ lang, switchUrl }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const switchLang = lang === "en" ? "hr" : "en";

  const fallbackSwitchUrl = "/" + switchLang + pathname.replace(`/${lang}`, "");
  const finalSwitchUrl = switchUrl || fallbackSwitchUrl;

  const subjects = SUBJECTS[lang];

  // aria-current value for a nav Link. `/{lang}` (home) only matches exactly;
  // everything else matches as a prefix so /en/category/science highlights the
  // Subjects parent too.
  const homeHref = `/${lang}`;
  const ariaCurrent = (href: string): "page" | undefined => {
    if (href === homeHref) return pathname === homeHref ? "page" : undefined;
    return pathname === href || pathname.startsWith(href + "/") ? "page" : undefined;
  };

  // Close the mobile menu on Escape (parity with the Subjects dropdown).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setSubjectsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Subjects dropdown keyboard support (disclosure pattern) ───────────────
  // Trigger is a button; items stay <Link>s (so SRs announce them as links).
  // Arrow keys / Home / End rove focus; Escape closes and returns focus to the
  // button; Tab closes and moves on naturally.
  const subjectsBtnRef = useRef<HTMLButtonElement>(null);
  const subjectItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  const focusSubjectItem = (index: number) => {
    const items = subjectItemsRef.current.filter(Boolean) as HTMLAnchorElement[];
    if (!items.length) return;
    items[(index + items.length) % items.length]?.focus();
  };

  const onSubjectsButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSubjectsOpen(true);
      requestAnimationFrame(() => focusSubjectItem(0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSubjectsOpen(true);
      requestAnimationFrame(() => focusSubjectItem(-1));
    } else if (e.key === "Escape" && subjectsOpen) {
      setSubjectsOpen(false);
    }
  };

  const onSubjectsMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = subjectItemsRef.current.filter(Boolean) as HTMLAnchorElement[];
    const current = items.indexOf(document.activeElement as HTMLAnchorElement);
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); focusSubjectItem(current + 1); break;
      case "ArrowUp":   e.preventDefault(); focusSubjectItem(current - 1); break;
      case "Home":      e.preventDefault(); focusSubjectItem(0); break;
      case "End":       e.preventDefault(); focusSubjectItem(-1); break;
      case "Escape":
        e.preventDefault();
        setSubjectsOpen(false);
        subjectsBtnRef.current?.focus();
        break;
      // Tab is handled by the container's onBlur (closes once focus leaves).
    }
  };

  return (
    <header className="sticky top-0 z-50 font-sans border-b border-gray-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      {/* Compact mobile bar (~48px tall) — expands on lg+ */}
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2 lg:py-4">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2 text-base md:text-xl font-bold"
        >
          <Image
            src="/images/logo.png"
            alt=""
            width={36}
            height={36}
            priority
            className="h-9 w-9 flex-shrink-0 object-contain"
          />
          <span>STEM Little Explorers</span>
        </Link>

        {/* Desktop nav — switches on at lg because the Croatian labels need the
            full 1024px container (brand + nav ≈ 992px at `gap-4`); they overflow
            below that. `gap-4` (not `gap-5`) keeps a small headroom buffer so
            adding a nav item doesn't tip HR into overflow at exactly 1024px. */}
        <nav className="hidden lg:flex gap-4 items-center text-sm">
          {/* Activities — tag-based page */}
          <Link
            href={`/${lang}/activities`}
            aria-current={ariaCurrent(`/${lang}/activities`)}
            className="flex items-center gap-1 whitespace-nowrap font-semibold text-brand hover:text-brand-hover aria-[current=page]:underline aria-[current=page]:underline-offset-4"
          >
            <span aria-hidden="true">⚡</span>
            {lang === "en" ? "Activities" : "Aktivnosti"}
          </Link>

          {/* Subjects dropdown */}
          <div
            className="relative"
            ref={dropdownRef}
            onBlur={(e) => {
              // Close once focus leaves the dropdown entirely (Tab/Shift+Tab out).
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setSubjectsOpen(false);
              }
            }}
          >
            <button
              ref={subjectsBtnRef}
              onClick={() => setSubjectsOpen((v) => !v)}
              onKeyDown={onSubjectsButtonKeyDown}
              className="flex items-center gap-1 whitespace-nowrap hover:opacity-70"
              aria-haspopup="true"
              aria-expanded={subjectsOpen}
              aria-controls="subjects-menu"
            >
              {lang === "en" ? "Subjects" : "Kategorije"}
              <svg
                className="w-3 h-3 mt-0.5"
                viewBox="0 0 10 6"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M0 0l5 6 5-6z" />
              </svg>
            </button>
            {subjectsOpen && (
              <div
                id="subjects-menu"
                onKeyDown={onSubjectsMenuKeyDown}
                className="absolute left-0 top-full mt-2 w-44 bg-white border rounded-lg shadow-lg py-1 z-50"
              >
                {subjects.map((s, i) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    ref={(el) => { subjectItemsRef.current[i] = el; }}
                    aria-current={ariaCurrent(s.href)}
                    className="block px-4 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-700 focus-visible:bg-indigo-50 focus-visible:text-indigo-700 aria-[current=page]:bg-indigo-100 aria-[current=page]:text-indigo-700 aria-[current=page]:font-semibold"
                    onClick={() => setSubjectsOpen(false)}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href={`/${lang}/topics`}
            aria-current={ariaCurrent(`/${lang}/topics`)}
            className="whitespace-nowrap hover:opacity-70 aria-[current=page]:font-semibold"
          >
            {lang === "en" ? "Topics" : "Teme"}
          </Link>

          <Link
            href={`/${lang}/${TOOLS_SLUG[lang]}`}
            aria-current={ariaCurrent(`/${lang}/${TOOLS_SLUG[lang]}`)}
            className="whitespace-nowrap hover:opacity-70 aria-[current=page]:font-semibold"
          >
            {lang === "en" ? "Tools" : "Alati"}
          </Link>

          <Link
            href={`/${lang}/about`}
            aria-current={ariaCurrent(`/${lang}/about`)}
            className="whitespace-nowrap hover:opacity-70 aria-[current=page]:font-semibold"
          >
            {lang === "en" ? "About" : "O nama"}
          </Link>

          <Link
            href={`/${lang}/contact`}
            aria-current={ariaCurrent(`/${lang}/contact`)}
            className="whitespace-nowrap hover:opacity-70 aria-[current=page]:font-semibold"
          >
            {lang === "en" ? "Contact" : "Kontakt"}
          </Link>

          <Link
            href={finalSwitchUrl}
            className="whitespace-nowrap px-3 py-1 border rounded hover:bg-gray-100"
          >
            {switchLang.toUpperCase()}
          </Link>

          <Search lang={lang} />
        </nav>

        <button
          className="lg:hidden p-2 -mr-2 text-xl leading-none"
          onClick={() => setOpen(!open)}
          aria-label={
            open
              ? lang === "hr" ? "Zatvori izbornik" : "Close menu"
              : lang === "hr" ? "Otvori izbornik" : "Open menu"
          }
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t">
          {/* Search — first item in mobile menu so it's reachable on small screens */}
          <div className="p-3 border-b">
            <Search lang={lang} />
          </div>

          <Link
            href={`/${lang}/activities`}
            className="block px-4 py-3 border-b font-semibold text-brand hover:bg-indigo-50"
            onClick={() => setOpen(false)}
          >
            ⚡ {lang === "en" ? "Activities" : "Aktivnosti"}
          </Link>

          {/* Subjects — flat list in mobile */}
          <div className="border-b">
            <p className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {lang === "en" ? "Subjects" : "Kategorije"}
            </p>
            {subjects.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="block px-6 py-2 text-sm hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                {s.label}
              </Link>
            ))}
          </div>

          <Link
            href={`/${lang}/topics`}
            className="block px-4 py-3 border-b hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            {lang === "en" ? "Topics" : "Teme"}
          </Link>

          <Link
            href={`/${lang}/${TOOLS_SLUG[lang]}`}
            className="block px-4 py-3 border-b font-semibold text-brand hover:bg-indigo-50"
            onClick={() => setOpen(false)}
          >
            🧰 {lang === "en" ? "Tools & games" : "Alati i igre"}
          </Link>

          <Link
            href={`/${lang}/about`}
            className="block px-4 py-3 border-b hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            {lang === "en" ? "About" : "O nama"}
          </Link>

          <Link
            href={`/${lang}/contact`}
            className="block px-4 py-3 border-b hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            {lang === "en" ? "Contact" : "Kontakt"}
          </Link>

          <Link
            href={finalSwitchUrl}
            className="block px-4 py-3 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            {switchLang.toUpperCase()}
          </Link>
        </div>
      )}
    </header>
  );
}
