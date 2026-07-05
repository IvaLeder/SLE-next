"use client";

import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { SUMMER_PDF, type Lang } from "@/lib/summer-ebook";

const MAX_EMAIL = 254;

const COPY = {
  en: {
    emailLabel: "Your email",
    emailPlaceholder: "you@example.com",
    consent:
      "Email me the e-book and the occasional STEM idea. I can unsubscribe anytime.",
    submit: "Send me the e-book",
    submitting: "Sending…",
    successTitle: "Check your inbox! 🎉",
    successBody: "We've emailed your copy of Summer of curiosity. It can take a minute to arrive — or grab it right now:",
    downloadNow: "Download it now",
    privacy: "We'll never share your email. See our",
    privacyLink: "Privacy Policy",
    errors: {
      recaptcha: "We couldn't verify you're human. Please reload the page and try again.",
      rate_limited: "Too many attempts. Please wait a few minutes and try again.",
      invalid_email: "Please enter a valid email address.",
      consent_required: "Please tick the box so we can email you the e-book.",
      validation: "Please check the form and try again.",
      send_failed: "Something went wrong on our end. Please try again in a moment.",
      network: "Network problem. Please check your connection and try again.",
      generic: "Something went wrong. Please try again later.",
    } as Record<string, string>,
  },
  hr: {
    emailLabel: "Vaš email",
    emailPlaceholder: "vi@primjer.com",
    consent:
      "Pošaljite mi e-knjigu i pokoju STEM ideju. Mogu se odjaviti u svakom trenutku.",
    submit: "Pošaljite mi e-knjigu",
    submitting: "Šaljem…",
    successTitle: "Provjerite inbox! 🎉",
    successBody: "Poslali smo vam primjerak knjige Ljeto znatiželje. Dostava može potrajati minutu — ili je preuzmite odmah:",
    downloadNow: "Preuzmite odmah",
    privacy: "Nikada nećemo dijeliti vaš email. Pogledajte našu",
    privacyLink: "Politiku privatnosti",
    errors: {
      recaptcha: "Nismo uspjeli potvrditi da niste robot. Osvježite stranicu i pokušajte ponovo.",
      rate_limited: "Previše pokušaja. Pričekajte nekoliko minuta i pokušajte ponovo.",
      invalid_email: "Unesite ispravnu adresu e-pošte.",
      consent_required: "Označite okvir kako bismo vam mogli poslati e-knjigu.",
      validation: "Provjerite obrazac i pokušajte ponovo.",
      send_failed: "Nešto je pošlo po zlu kod nas. Pokušajte ponovo za trenutak.",
      network: "Problem s mrežom. Provjerite vezu i pokušajte ponovo.",
      generic: "Nešto je pošlo po zlu. Pokušajte ponovo kasnije.",
    } as Record<string, string>,
  },
} as const;

const CODE_MAP: Record<string, string> = {
  recaptcha_failed: "recaptcha",
  recaptcha: "recaptcha",
  rate_limited: "rate_limited",
  invalid_email: "invalid_email",
  consent_required: "consent_required",
  missing_fields: "validation",
  too_large: "validation",
  send_failed: "send_failed",
  network: "network",
};

export default function SummerSignupForm({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const pdf = SUMMER_PDF[lang];
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorCode, setErrorCode] = useState("generic");
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const fail = (code: string) => {
    setErrorCode(code);
    setStatus("error");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      fail("consent_required");
      return;
    }
    if (!siteKey) {
      fail("recaptcha");
      return;
    }
    setStatus("submitting");

    let token: string | null | undefined;
    try {
      token = await recaptchaRef.current?.executeAsync();
      recaptchaRef.current?.reset();
    } catch {
      recaptchaRef.current?.reset();
      fail("recaptcha");
      return;
    }
    if (!token) {
      fail("recaptcha");
      return;
    }

    try {
      const res = await fetch("/api/summer-ebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, lang, token, website }),
      });
      if (res.ok) {
        setStatus("success");
        return;
      }
      const data = await res.json().catch(() => ({}));
      fail(typeof data?.code === "string" ? data.code : "generic");
    } catch {
      fail("network");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
        <p className="font-sans text-xl font-bold text-gray-900">{t.successTitle}</p>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-gray-600">{t.successBody}</p>
        <a
          href={pdf}
          download
          className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 font-sans text-sm font-semibold text-white"
          style={{ background: "#FB6F52" }}
        >
          ↓ {t.downloadNow}
        </a>
      </div>
    );
  }

  const errorMessage = t.errors[CODE_MAP[errorCode] ?? "generic"] ?? t.errors.generic;

  return (
    <form onSubmit={handleSubmit} className="font-sans" noValidate>
      {/* Honeypot */}
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="se-website">Website (leave blank)</label>
        <input
          id="se-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <label htmlFor="se-email" className="block text-sm font-semibold text-gray-700">
        {t.emailLabel}
      </label>
      <input
        id="se-email"
        name="email"
        type="email"
        required
        maxLength={MAX_EMAIL}
        autoComplete="email"
        inputMode="email"
        placeholder={t.emailPlaceholder}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FB6F52]"
      />

      <label className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-600">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (status === "error") setStatus("idle");
          }}
          className="mt-1 h-4 w-4 flex-none accent-[#FB6F52]"
        />
        <span>{t.consent}</span>
      </label>

      {siteKey && <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={siteKey} />}

      {status === "error" && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-4 w-full rounded-full px-6 py-3 font-sans text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        style={{ background: "#FB6F52" }}
      >
        {status === "submitting" ? t.submitting : t.submit}
      </button>

      <p className="mt-3 text-center text-xs text-gray-400">
        {t.privacy}{" "}
        <a href={`/${lang}/privacy`} className="underline hover:text-gray-600">
          {t.privacyLink}
        </a>
        .
      </p>
    </form>
  );
}
