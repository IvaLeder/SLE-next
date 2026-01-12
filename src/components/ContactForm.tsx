"use client";

import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

type Props = {
  lang: "en" | "hr";
};

export default function ContactForm({ lang }: Props) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
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
        setFormData({ name: "", email: "", message: "" });
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
    },
  }[lang];

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t.title}</h1>

      {status === "success" && (
        <div className="p-4 mb-4 text-green-800 bg-green-100 border border-green-200 rounded">
          {t.success}
        </div>
      )}

      {status === "error" && (
        <div className="p-4 mb-4 text-red-800 bg-red-100 border border-red-200 rounded">
          {t.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* reCAPTCHA */}
        <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={siteKey as string} />

        {/* Button */}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "submitting" ? t.sending : t.send}
        </button>
      </form>
    </main>
  );
}