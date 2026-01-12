import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Search from "./Search";

export default function Header({ lang }: { lang: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Simple language switcher logic
  const switchLang = lang === "en" ? "hr" : "en";
  const switchUrl = "/" + switchLang + pathname.replace(`/${lang}`, "");

  const nav = [
    { href: `/${lang}`, label: lang === "en" ? "Home" : "Naslovnica" },
    { href: `/${lang}/category/activities`, label: lang === "en" ? "Activities" : "Aktivnosti" },
    { href: `/${lang}/category/psychology`, label: lang === "en" ? "Psychology" : "Psihologija" },
    { href: `/${lang}/about`, label: lang === "en" ? "About" : "O nama" },
    { href: `/${lang}/contact`, label: lang === "en" ? "Contact" : "Kontakt" }
  ];

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link href={`/${lang}`} className="text-xl font-bold">
          STEM Explorers
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6 items-center">
          {nav.map(item => (
            <Link key={item.href} href={item.href} className="hover:opacity-70">
              {item.label}
            </Link>
          ))}

          {/* Language Switcher */}
          <Link
            href={switchUrl}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            {switchLang.toUpperCase()}
          </Link>
          <Search lang={lang as "en" | "hr"} />
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-3 border-b hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href={switchUrl}
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