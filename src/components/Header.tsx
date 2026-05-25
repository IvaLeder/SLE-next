"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Search from "./Search";

type HeaderProps = {
  lang: "en" | "hr";
  switchUrl?: string;
};

const SUBJECTS = {
  en: [
    { href: "/en/category/science",      label: "Science" },
    { href: "/en/category/engineering",  label: "Engineering" },
    { href: "/en/category/math",         label: "Math" },
    { href: "/en/category/technology",   label: "Technology" },
    { href: "/en/category/psychology",   label: "Psychology" },
  ],
  hr: [
    { href: "/hr/category/science",     label: "Znanost" },
    { href: "/hr/category/engineering", label: "Inženjerstvo" },
    { href: "/hr/category/math",        label: "Matematika" },
    { href: "/hr/category/technology",  label: "Tehnologija" },
    { href: "/hr/category/psychology",  label: "Psihologija" },
  ],
};

export default function Header({ lang, switchUrl }: HeaderProps) {
  const [open, setOpen]           = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname   = usePathname();
  const switchLang = lang === "en" ? "hr" : "en";

  const fallbackSwitchUrl = "/" + switchLang + pathname.replace(`/${lang}`, "");
  const finalSwitchUrl    = switchUrl || fallbackSwitchUrl;

  const subjects = SUBJECTS[lang];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSubjectsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <Link href={`/${lang}`} className="text-xl font-bold">
          STEM Explorers
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 items-center text-sm">
          <Link href={`/${lang}`} className="hover:opacity-70">
            {lang === "en" ? "Home" : "Naslovnica"}
          </Link>

          {/* Activities — tag-based page */}
          <Link
            href={`/${lang}/activities`}
            className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span aria-hidden="true">⚡</span>
            {lang === "en" ? "Activities" : "Aktivnosti"}
          </Link>

          {/* Subjects dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSubjectsOpen((v) => !v)}
              className="flex items-center gap-1 hover:opacity-70"
              aria-haspopup="true"
              aria-expanded={subjectsOpen}
            >
              {lang === "en" ? "Subjects" : "Predmeti"}
              <svg className="w-3 h-3 mt-0.5" viewBox="0 0 10 6" fill="currentColor">
                <path d="M0 0l5 6 5-6z" />
              </svg>
            </button>
            {subjectsOpen && (
              <div className="absolute left-0 top-full mt-2 w-44 bg-white border rounded-lg shadow-lg py-1 z-50">
                {subjects.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="block px-4 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-700"
                    onClick={() => setSubjectsOpen(false)}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href={`/${lang}/about`} className="hover:opacity-70">
            {lang === "en" ? "About" : "O nama"}
          </Link>

          <Link href={`/${lang}/contact`} className="hover:opacity-70">
            {lang === "en" ? "Contact" : "Kontakt"}
          </Link>

          <Link
            href={finalSwitchUrl}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            {switchLang.toUpperCase()}
          </Link>

          <Search lang={lang} />
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Open menu">
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t">
          <Link
            href={`/${lang}`}
            className="block px-4 py-3 border-b hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            {lang === "en" ? "Home" : "Naslovnica"}
          </Link>

          <Link
            href={`/${lang}/activities`}
            className="block px-4 py-3 border-b font-semibold text-indigo-600 hover:bg-indigo-50"
            onClick={() => setOpen(false)}
          >
            ⚡ {lang === "en" ? "Activities" : "Aktivnosti"}
          </Link>

          {/* Subjects — flat list in mobile */}
          <div className="border-b">
            <p className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {lang === "en" ? "Subjects" : "Predmeti"}
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
