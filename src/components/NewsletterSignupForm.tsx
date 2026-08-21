"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { THANK_YOU_SLUG, WELCOME_SLUG, type Lang } from "@/lib/newsletter";

const MAX_EMAIL = 254;
const MAX_NAME = 100;

const COPY = {
  en: {
    emailLabel: "Your email",
    emailPlaceholder: "you@example.com",
    firstNameLabel: "First name (optional)",
    firstNamePlaceholder: "e.g. Alex",
    consent:
      "Yes, send me practical STEM activities, parenting reads and free resources. I can unsubscribe anytime.",
    compactConsent: "Yes, send me these emails. I can unsubscribe anytime.",
    submit: "Get fresh ideas",
    submitting: "Joining…",
    privacy: "We'll never share your email. See our",
    privacyLink: "Privacy Policy",
    compactNote: "2–3 emails a month · No spam",
    notices: {
      already_subscribed: "You're already subscribed, you're all set!",
      confirmation_pending:
        "This address is already waiting for confirmation. Check for an earlier Mailchimp email, or try another address.",
    } as Record<string, string>,
    errors: {
      recaptcha: "We couldn't verify you're human. Please reload the page and try again.",
      rate_limited: "Too many attempts. Please wait a few minutes and try again.",
      invalid_email: "Please enter a valid email address.",
      consent_required: "Please tick the box so we can add you to the list.",
      validation: "Please check the form and try again.",
      send_failed: "Something went wrong on our end. Please try again in a moment.",
      configuration_error:
        "Signup is temporarily unavailable. We've logged the problem, please try again later.",
      address_unavailable:
        "This address can't be added automatically. Please try another address or contact us.",
      network: "Network problem. Please check your connection and try again.",
      generic: "Something went wrong. Please try again later.",
    } as Record<string, string>,
  },
  hr: {
    emailLabel: "Vaš email",
    emailPlaceholder: "vi@primjer.com",
    firstNameLabel: "Ime (neobavezno)",
    firstNamePlaceholder: "npr. Iva",
    consent:
      "Da, šaljite mi praktične STEM aktivnosti, tekstove za roditelje i besplatne materijale. Mogu se odjaviti bilo kada.",
    compactConsent: "Da, želim primati ove poruke. Mogu se odjaviti bilo kada.",
    submit: "Želim nove ideje",
    submitting: "Dodajemo vas…",
    privacy: "Nikada nećemo dijeliti vaš email. Pogledajte našu",
    privacyLink: "Politiku privatnosti",
    compactNote: "1–2 emaila mjesečno · Bez spama",
    notices: {
      already_subscribed: "Već ste pretplaćeni, sve je spremno!",
      confirmation_pending:
        "Ova adresa već čeka potvrdu. Potražite raniji Mailchimp email ili pokušajte s drugom adresom.",
    } as Record<string, string>,
    errors: {
      recaptcha: "Nismo uspjeli potvrditi da niste robot. Osvježite stranicu i pokušajte ponovo.",
      rate_limited: "Previše pokušaja. Pričekajte nekoliko minuta i pokušajte ponovo.",
      invalid_email: "Unesite ispravnu adresu e-pošte.",
      consent_required: "Označite pristanak kako bismo vas mogli dodati na popis.",
      validation: "Provjerite obrazac i pokušajte ponovo.",
      send_failed: "Nešto je pošlo po zlu na našoj strani. Pokušajte ponovo za trenutak.",
      configuration_error:
        "Pretplata je privremeno nedostupna. Zabilježili smo problem, pokušajte ponovo kasnije.",
      address_unavailable:
        "Ovu adresu ne možemo automatski dodati. Pokušajte s drugom adresom ili nam se javite.",
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
  configuration_error: "configuration_error",
  address_unavailable: "address_unavailable",
  network: "network",
};

// The portal target only exists in the browser, so the badge must stay unrendered
// for the server pass and the first client render. useSyncExternalStore gives us
// that "are we hydrated yet" flag without writing state from an effect.
const subscribeNoop = () => () => {};

/**
 * The newsletter signup form. Two variants:
 *
 * - "full" (subscribe landing page): email, optional first name, explicit GDPR
 *   consent checkbox, privacy-policy line and eager reCAPTCHA.
 * - "compact" (homepage/article promos, floating card and footer): email,
 *   explicit consent, button and short trust copy. reCAPTCHA only mounts once
 *   the reader focuses a field, so article pages don't pay its script cost for
 *   a form most readers never touch.
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
  compactLayout = "stacked",
}: {
  lang: Lang;
  source?: string;
  variant?: "full" | "compact";
  compactLayout?: "stacked" | "inline";
}) {
  const t = COPY[lang];
  const uid = useId();
  const emailId = `nl-email-${uid}`;
  const firstNameId = `nl-first-name-${uid}`;
  const consentId = `nl-consent-${uid}`;
  const honeypotId = `nl-website-${uid}`;
  const buttonId =
    source === "subscribe-page" ? "newsletter-subscribe" : `newsletter-subscribe-${source}`;
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [armed, setArmed] = useState(variant === "full"); // compact: mount reCAPTCHA on first focus
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [status, setStatus] = useState<"idle" | "submitting" | "notice" | "error">("idle");
  const [errorCode, setErrorCode] = useState("generic");
  const [noticeCode, setNoticeCode] = useState("");
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
          firstName: variant === "full" ? firstName : "",
          lastName: "",
          consent,
          token,
          website,
          source,
          lang,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data?.code === "already_subscribed" || data?.code === "confirmation_pending")) {
        setNoticeCode(data.code);
        setStatus("notice");
        return;
      }
      if (res.ok) {
        // Full navigation (not router.push) so the thank-you pageview always
        // fires in GTM regardless of how its triggers handle SPA transitions.
        const slug = data?.code === "subscribed" ? WELCOME_SLUG[lang] : THANK_YOU_SLUG[lang];
        window.location.assign(`/${lang}/${slug}`);
        return;
      }
      fail(typeof data?.code === "string" ? data.code : "generic");
    } catch {
      fail("network");
    }
  };

  const errorMessage = t.errors[CODE_MAP[errorCode] ?? "generic"] ?? t.errors.generic;
  const noticeMessage = t.notices[noticeCode] ?? "";

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
        <div className={compactLayout === "inline" ? "sm:flex sm:items-start sm:gap-2" : ""}>
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
              if (status === "error" || status === "notice") setStatus("idle");
            }}
            className="min-w-0 flex-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-newsletter"
          />

          <button
            id={buttonId}
            type="submit"
            disabled={status === "submitting"}
            className={`w-full rounded-lg bg-newsletter px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-newsletter-hover disabled:opacity-60 ${
              compactLayout === "inline" ? "mt-2 whitespace-nowrap sm:mt-0 sm:w-auto" : "mt-2"
            }`}
          >
            {status === "submitting" ? t.submitting : t.submit}
          </button>
        </div>

        <label
          htmlFor={consentId}
          className="mt-2 flex items-start gap-2 text-[11px] leading-snug text-gray-600"
        >
          <input
            id={consentId}
            name="consent"
            type="checkbox"
            required
            checked={consent}
            onFocus={() => setArmed(true)}
            onChange={(e) => {
              setArmed(true);
              setConsent(e.target.checked);
              if (status === "error" || status === "notice") setStatus("idle");
            }}
            className="mt-0.5 h-4 w-4 flex-none accent-newsletter"
          />
          <span>{t.compactConsent}</span>
        </label>

        {recaptcha}

        {status === "error" && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
            {errorMessage}
          </p>
        )}

        {status === "notice" && (
          <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800" role="status">
            {noticeMessage}
          </p>
        )}

        <p className="mt-2 text-center text-[11px] leading-snug text-gray-400">
          {t.compactNote} ·{" "}
          <a href={`/${lang}/privacy`} className="underline hover:text-gray-600">
            {t.privacyLink}
          </a>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="font-sans" noValidate>
      {honeypot}

      <label htmlFor={emailId} className="block text-sm font-semibold text-gray-700">
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
          if (status === "error" || status === "notice") setStatus("idle");
        }}
        className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-newsletter"
      />

      <label htmlFor={firstNameId} className="mt-4 block text-sm font-semibold text-gray-700">
        {t.firstNameLabel}
      </label>
      <input
        id={firstNameId}
        name="firstName"
        type="text"
        maxLength={MAX_NAME}
        autoComplete="given-name"
        placeholder={t.firstNamePlaceholder}
        value={firstName}
        onChange={(e) => {
          setFirstName(e.target.value);
          if (status === "error" || status === "notice") setStatus("idle");
        }}
        className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-newsletter"
      />

      <label
        htmlFor={consentId}
        className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-600"
      >
        <input
          id={consentId}
          name="consent"
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (status === "error" || status === "notice") setStatus("idle");
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

      {status === "notice" && (
        <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800" role="status">
          {noticeMessage}
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
