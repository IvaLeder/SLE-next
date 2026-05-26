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
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const token = await recaptchaRef.current?.executeAsync();
      recaptchaRef.current?.reset();

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, token }),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "", website: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
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
      error: "❌ Something went wrong. Please try again later.",
      charsRemaining: (n: number) => `${n} characters remaining`,
    },
    hr: {
      title: "Kontakt",
      name: "Ime",
      email: "Email",
      message: "Poruka",
      send: "Pošalji poruku",
      sending: "Šaljem...",
      success: "✅ Hvala! Vaša poruka je poslana.",
      error: "❌ Nešto je pošlo po zlu. Pokušajte ponovo kasnije.",
      charsRemaining: (n: number) => `${n} preostalih znakova`,
    },
  }[lang];

  const messageRemaining = MAX_MESSAGE - formData.message.length;

  return (
    // The wrapper page already provides <main>, so use a div here to avoid
    // nested <main> elements (invalid HTML).
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t.title}</h1>

      {status === "success" && (
        <div className="p-4 mb-4 text-green-800 bg-green-100 border border-green-200 rounded" role="status">
          {t.success}
        </div>
      )}

      {status === "error" && (
        <div className="p-4 mb-4 text-red-800 bg-red-100 border border-red-200 rounded" role="alert">
          {t.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
            className={`mt-1 text-xs text-right ${messageRemaining < 100 ? "text-amber-600" : "text-gray-400"}`}
            aria-live="polite"
          >
            {t.charsRemaining(messageRemaining)}
          </p>
        </div>

        {/* reCAPTCHA */}
        <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={siteKey as string} />

        {/* Button */}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {status === "submitting" ? t.sending : t.send}
        </button>
      </form>
    </div>
  );
}