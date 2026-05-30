"use client";

import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

type Props = {
  lang: "en" | "hr";
};

// Field caps — keep these aligned with the server (api/contact/route.ts).
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

export default function ContactForm({ lang }: Props) {
  // The `website` field is a honeypot — invisible to humans, irresistible to bots.
  // If a request hits the API with `website` non-empty, the server silently
  // discards it.
  const [formData, setFormData] = useState({ name: "", email: "", message: "", website: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  // Holds the reason for the most recent failure so we can show a specific,
  // actionable message instead of a generic "something went wrong".
  const [errorCode, setErrorCode] = useState<string>("generic");
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  // If the public site key never made it into the build, the widget can't
  // render a usable challenge — fail loud and early rather than letting the
  // user fill everything in only to hit an opaque error on submit.
  const recaptchaMisconfigured = !siteKey;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear a previous failure as soon as the user starts fixing things.
    if (status === "error") setStatus("idle");
  };

  const fail = (code: string) => {
    setErrorCode(code);
    setStatus("error");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (recaptchaMisconfigured) {
      fail("recaptcha");
      return;
    }

    setStatus("submitting");

    // ── 1. Get a reCAPTCHA token ──────────────────────────────────────────
    // executeAsync can throw (network) or resolve to null (e.g. the site key's
    // domain list doesn't include the current host — the exact case that broke
    // this form on the Vercel preview URL). Treat both as a reCAPTCHA failure.
    let token: string | null | undefined;
    try {
      token = await recaptchaRef.current?.executeAsync();
      recaptchaRef.current?.reset();
    } catch (err) {
      console.error("reCAPTCHA error:", err);
      recaptchaRef.current?.reset();
      fail("recaptcha");
      return;
    }
    if (!token) {
      fail("recaptcha");
      return;
    }

    // ── 2. Submit to the API ──────────────────────────────────────────────
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, token }),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "", website: "" });
        return;
      }

      // Map the server's stable error code to a friendly message.
      const data = await res.json().catch(() => ({}));
      fail(typeof data?.code === "string" ? data.code : "generic");
    } catch (err) {
      console.error(err);
      fail("network");
    }
  };

  // Texts in both languages
  const t = {
    en: {
      title: "Contact",
      name: "Name",
      email: "Email",
      message: "Message",
      send: "Send message",
      sending: "Sending...",
      success: "✅ Thank you! Your message has been sent.",
      charsRemaining: (n: number) => `${n} characters remaining`,
      errors: {
        recaptcha:    "❌ We couldn't verify you're human. Please reload the page and try again.",
        rate_limited: "❌ Too many attempts. Please wait a few minutes and try again.",
        invalid_email:"❌ Please enter a valid email address.",
        validation:   "❌ Please check the form and try again.",
        send_failed:  "❌ We couldn't send your message right now. Please try again later, or email us directly at stem.littleexplorers@gmail.com.",
        network:      "❌ Network problem. Please check your connection and try again.",
        generic:      "❌ Something went wrong. Please try again later.",
      } as Record<string, string>,
    },
    hr: {
      title: "Kontakt",
      name: "Ime",
      email: "Email",
      message: "Poruka",
      send: "Pošalji poruku",
      sending: "Šaljem...",
      success: "✅ Hvala! Vaša poruka je poslana.",
      charsRemaining: (n: number) => `${n} preostalih znakova`,
      errors: {
        recaptcha:    "❌ Nismo uspjeli potvrditi da niste robot. Osvježite stranicu i pokušajte ponovo.",
        rate_limited: "❌ Previše pokušaja. Pričekajte nekoliko minuta i pokušajte ponovo.",
        invalid_email:"❌ Unesite ispravnu adresu e-pošte.",
        validation:   "❌ Provjerite obrazac i pokušajte ponovo.",
        send_failed:  "❌ Trenutačno ne možemo poslati vašu poruku. Pokušajte kasnije ili nam pišite izravno na stem.littleexplorers@gmail.com.",
        network:      "❌ Problem s mrežom. Provjerite vezu i pokušajte ponovo.",
        generic:      "❌ Nešto je pošlo po zlu. Pokušajte ponovo kasnije.",
      } as Record<string, string>,
    },
  }[lang];

  const messageRemaining = MAX_MESSAGE - formData.message.length;

  // Normalise the various server/client codes to one of the message buckets.
  const errorMessage = (() => {
    const map: Record<string, string> = {
      recaptcha_failed: "recaptcha",
      recaptcha:        "recaptcha",
      rate_limited:     "rate_limited",
      invalid_email:    "invalid_email",
      missing_fields:   "validation",
      invalid_fields:   "validation",
      too_long:         "validation",
      too_large:        "validation",
      send_failed:      "send_failed",
      network:          "network",
    };
    return t.errors[map[errorCode] ?? "generic"] ?? t.errors.generic;
  })();

  return (
    // The wrapper page already provides <main>, so use a div here to avoid
    // nested <main> elements (invalid HTML).
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">{t.title}</h1>

      {status === "success" && (
        <div className="p-4 mb-4 text-green-800 bg-green-100 border border-green-200 rounded" role="status">
          {t.success}
        </div>
      )}

      {status === "error" && (
        <div className="p-4 mb-4 text-red-800 bg-red-100 border border-red-200 rounded" role="alert">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-sans" noValidate>
        {/* Honeypot — hidden from real users via CSS, autocomplete off,
            tabindex=-1 so keyboard users skip it, aria-hidden so screen
            readers ignore it. Bots fill ALL inputs blindly and get caught. */}
        <div className="absolute -left-[10000px] w-px h-px overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website (leave blank)</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            {t.name}
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={MAX_NAME}
            autoComplete="name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            {t.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            maxLength={MAX_EMAIL}
            autoComplete="email"
            inputMode="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            {t.message}
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            required
            maxLength={MAX_MESSAGE}
            aria-describedby="message-counter"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p
            id="message-counter"
            className={`mt-1 text-xs text-right ${messageRemaining < 100 ? "text-amber-600" : "text-gray-500"}`}
            aria-live="polite"
          >
            {t.charsRemaining(messageRemaining)}
          </p>
        </div>

        {/* reCAPTCHA — only mount when we actually have a key, otherwise the
            widget renders its own opaque "Invalid site key" error box. */}
        {siteKey && (
          <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={siteKey} />
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="bg-brand text-white px-5 py-2 rounded-lg hover:bg-brand-hover disabled:opacity-50 transition-colors"
        >
          {status === "submitting" ? t.sending : t.send}
        </button>
      </form>
    </div>
  );
}