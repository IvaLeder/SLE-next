import Link from "next/link";

const content = {
  en: {
    tag: "For parents & educators",
    headline: "STEM & Science\nfor Curious Kids",
    sub: "Hands-on experiments, child development guides and psychology insights: practical ideas you can try today.",
    primary: { label: "Browse activities", href: "/en/activities" },
    secondary: { label: "Browse by subject", href: "/en/category/science" },
  },
  hr: {
    tag: "Za roditelje i odgajatelje",
    headline: "STEM i Znanosti\nza Znatiželjnu Djecu",
    sub: "Praktični pokusi, vodiči za razvoj djeteta i savjeti iz psihologije: ideje koje možete isprobati odmah.",
    primary: { label: "Pregledaj aktivnosti", href: "/hr/activities" },
    secondary: { label: "Pregledaj po kategoriji", href: "/hr/category/science" },
  },
};

export default function Hero({ lang }: { lang: "en" | "hr" }) {
  const t = content[lang];

  return (
    // Brand gradient hero — no image, so no LCP cost and nothing to stretch.
    // A slightly deepened indigo→slate pour gives the aurora glow room to read.
    <div className="relative w-full h-[340px] md:h-[440px] overflow-hidden bg-gradient-to-br from-brand-hover via-brand-deep to-slate-900">
      {/* Aurora glow blobs — soft coloured light for depth. Decorative only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-32 h-[360px] w-[360px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,.55), transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -bottom-40 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,.40), transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[18%] -top-32 h-[300px] w-[300px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,.40), transparent 70%)" }}
      />

      {/* Faint STEM doodles — theme texture, hidden on small screens to avoid clutter. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
        fill="none"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth={2}
      >
        <circle cx="13%" cy="28%" r="30" />
        <circle cx="13%" cy="28%" r="12" />
        <rect x="8%" y="66%" width="42" height="56" rx="4" />
        <circle cx="89%" cy="70%" r="24" />
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute hidden font-sans text-4xl font-bold md:block" style={{ left: "9%", top: "16%", color: "rgba(255,255,255,0.16)" }}>π</div>
      <div aria-hidden="true" className="pointer-events-none absolute hidden font-sans text-5xl font-bold md:block" style={{ left: "90%", top: "28%", color: "rgba(255,255,255,0.16)" }}>+</div>
      <div aria-hidden="true" className="pointer-events-none absolute hidden text-3xl md:block" style={{ left: "90%", top: "74%", opacity: 0.4 }}>🚀</div>
      <div aria-hidden="true" className="pointer-events-none absolute hidden text-3xl md:block" style={{ left: "5%", top: "46%", opacity: 0.35 }}>🧪</div>

      {/* Text content — centred over the glow */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span className="font-sans text-xs font-semibold uppercase tracking-widest text-brand-pale mb-3">
          {t.tag}
        </span>

        {/* h1 on the homepage — good for SEO, describes the page purpose */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight whitespace-pre-line mb-4">
          {t.headline}
        </h1>

        <p className="text-brand-tint text-sm md:text-base mb-6 max-w-md leading-relaxed">
          {t.sub}
        </p>

        <div className="flex flex-wrap justify-center gap-3 font-sans">
          {/* Primary is white-on-gradient so it pops against the indigo field. */}
          <Link
            href={t.primary.href}
            className="inline-block px-5 py-2.5 bg-white hover:bg-brand-soft text-brand text-sm font-semibold rounded-lg transition-colors"
          >
            {t.primary.label} →
          </Link>
          <Link
            href={t.secondary.href}
            className="inline-block px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur text-white text-sm font-semibold rounded-lg ring-1 ring-white/40 transition-colors"
          >
            {t.secondary.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
