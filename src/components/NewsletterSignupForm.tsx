"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { THANK_YOU_SLUG, type Lang } from "@/lib/newsletter";

const MAX_EMAIL = 254;

const MAX_NAME = 100;

const COPY = {
  en: {
    emailLabel: "Your email",
    emailPlaceholder: "you@example.com",
    firstNameLabel: "First name (optional)",
    lastNameLabel: "Last name (optional)",
    consent:
      "Send me the newsletter with new activities and articles. I can unsubscribe anytime.",
    submit: "Subscribe",
    submitting: "Subscribing…",
    privacy: "We'll never share your email. See our",
    privacyLink: "Privacy Policy",
    compactNote: "No spam, unsubscribe anytime.",
    errors: {
      recaptcha: "We couldn't verify you're human. Please reload the page and try again.",
      rate_limited: "Too many attempts. Please wait a few minutes and try again.",
      invalid_email: "Please enter a valid email address.",
      consent_required: "Please tick the box so we can add you to the list.",
      validation: "Please check the form and try again.",
      send_failed: "Something went wrong on our end. Please try again in a moment.",
      network: "Network problem. Please check your connection and try again.",
      generic: "Something went wrong. Please try again later.",
    } as Record<string, string>,
  },
  hr: {
    emailLabel: "Vaš email",
    emailPlaceholder: "vi@primjer.com",
    firstNameLabel: "Ime (neobavezno)",
    lastNameLabel: "Prezime (neobavezno)",
    consent:
      "Šaljite mi newsletter s novim aktivnostima i člancima. Mogu se odjaviti u svakom trenutku.",
    submit: "Pretplati se",
    submitting: "Pretplaćujem…",
    privacy: "Nikada nećemo dijeliti vaš email. Pogledajte našu",
    privacyLink: "Politiku privatnosti",
    compactNote: "Bez spama, odjava u svakom trenutku.",
    errors: {
      recaptcha: "Nismo uspjeli potvrditi da niste robot. Osvježite stranicu i pokušajte ponovo.",
      rate_limited: "Previše pokušaja. Pričekajte nekoliko minuta i pokušajte ponovo.",
      invalid_email: "Unesite ispravnu adresu e-pošte.",
      consent_required: "Označite okvir kako bismo vas mogli dodati na popis.",
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

// The portal target only exists in the browser, so the badge must stay unrendered
// for the server pass and the first client render. useSyncExternalStore gives us
// that "are we hydrated yet" flag without writing state from an effect.
const subscribeNoop = () => () => {};

/**
 * The newsletter signup form. Two variants:
 *
 * - "full" (subscribe landing page): label, explicit GDPR consent checkbox,
 *   privacy-policy line, eager reCAPTCHA.
 * - "compact" (article boxes: floating card + end-of-article CTA): email +
 *   button + microcopy only. Consent is implied by the act of subscribing
 *   (the double opt-in email is the explicit consent step), and reCAPTCHA
 *   only mounts once the reader focuses the field, so article pages don't
 *   pay its script cost for a form most readers never touch.
 *
 * Multiple instances can hydrate on one page (floating + inline), so all
 * DOM ids are namespaced per instance via useId; the GTM button id is
 * per-source instead ("newsletter-subscribe" on the landing page,
 * "newsletter-subscribe-<source>" elsewhere).
 */
export default function NewsletterSignupForm({
  lang,
  source = "subscribe-page",
  variant = "full",
}: {
  lang: Lang;
  source?: string;
  variant?: "full" | "compact";
}) {
  const t = COPY[lang];
  const uid = useId();
  const emailId = `nl-email-${uid}`;
  const honeypotId = `nl-website-${uid}`;
  const buttonId =
    source === "subscribe-page" ? "newsletter-subscribe" : `newsletter-subscribe-${source}`;
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState(""); // full variant only
  const [lastName, setLastName] = useState(""); // full variant only
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [armed, setArmed] = useState(variant === "full"); // compact: mount reCAPTCHA on first focus
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorCode, setErrorCode] = useState("generic");
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const fail = (code: string) => {
    setErrorCode(code);
    setStatus("error");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (variant === "full" && !consent) {
      fail("consent_required");
      return;
    }
    if (!siteKey) {
      fail("recaptcha");
      return;
    }
    setArmed(true); // safety net (e.g. autofill submitted without a focus event)
    setStatus("submitting");

    let token: string | null | undefined;
    try {
      // react-google-recaptcha queues execute() until the script is ready, so
      // a fast typer racing the lazy-mounted widget still resolves correctly.
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
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          consent: variant === "compact" ? true : consent,
          token,
          website,
          source,
        }),
      });
      if (res.ok) {
        // Full navigation (not router.push) so the thank-you pageview always
        // fires in GTM regardless of how its triggers handle SPA transitions.
        window.location.assign(`/${lang}/${THANK_YOU_SLUG[lang]}`);
        return;
      }
      const data = await res.json().catch(() => ({}));
      fail(typeof data?.code === "string" ? data.code : "generic");
    } catch {
      fail("network");
    }
  };

  const errorMessage = t.errors[CODE_MAP[errorCode] ?? "generic"] ?? t.errors.generic;

  // The badge is portalled to <body>: the floating card sits inside a CSS
  // transform (-translate-y-1/2), which would hijack the badge's
  // position:fixed and drop it on top of the submit button.
  const recaptcha =
    mounted && armed && siteKey
      ? createPortal(
          <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={siteKey} />,
          document.body,
        )
      : null;

  const honeypot = (
    <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
      <label htmlFor={honeypotId}>Website (leave blank)</label>
      <input
        id={honeypotId}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />
    </div>
  );

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="font-sans text-left" noValidate>
        {honeypot}
        <label htmlFor={emailId} className="sr-only">
          {t.emailLabel}
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          maxLength={MAX_EMAIL}
          autoComplete="email"
          inputMode="email"
          placeholder={t.emailPlaceholder}
          value={email}
          onFocus={() => setArmed(true)}
          onChange={(e) => {
            setArmed(true);
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-newsletter"
        />

        {recaptcha}

        {status === "error" && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          id={buttonId}
          type="submit"
          disabled={status === "submitting"}
          className="mt-2 w-full rounded-lg bg-newsletter px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-newsletter-hover disabled:opacity-60"
        >
          {status === "submitting" ? t.submitting : t.submit}
        </button>

        <p className="mt-2 text-center text-[11px] leading-snug text-gray-400">{t.compactNote}</p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="font-sans" noValidate>
      {honeypot}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`nl-fname-${uid}`} className="block text-sm font-semibold text-gray-700">
            {t.firstNameLabel}
          </label>
          <input
            id={`nl-fname-${uid}`}
            name="firstName"
            type="text"
            maxLength={MAX_NAME}
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-newsletter"
          />
        </div>
        <div>
          <label htmlFor={`nl-lname-${uid}`} className="block text-sm font-semibold text-gray-700">
            {t.lastNameLabel}
          </label>
          <input
            id={`nl-lname-${uid}`}
            name="lastName"
            type="text"
            maxLength={MAX_NAME}
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-newsletter"
          />
        </div>
      </div>

      <label htmlFor={emailId} className="mt-3 block text-sm font-semibold text-gray-700">
        {t.emailLabel}
      </label>
      <input
        id={emailId}
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
        className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-newsletter"
      />

      <label className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-600">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (status === "error") setStatus("idle");
          }}
          className="mt-1 h-4 w-4 flex-none accent-newsletter"
        />
        <span>{t.consent}</span>
      </label>

      {recaptcha}

      {status === "error" && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        id={buttonId}
        type="submit"
        disabled={status === "submitting"}
        className="mt-4 w-full rounded-full bg-newsletter px-6 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-newsletter-hover disabled:opacity-60"
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
