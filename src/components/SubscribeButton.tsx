"use client";
import { useState, useEffect } from "react";

export function SubscribeButton({ lang = "en" }: { lang?: "en" | "hr" }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = setInterval(() => {
      // @ts-expect-error Mailchimp global
      if (window.MC_FORM?.open) {
        setReady(true);
        clearInterval(check);
      }
    }, 300);

    return () => clearInterval(check);
  }, []);

  const openPopup = () => {
    // @ts-expect-error Mailchimp global
    if (typeof window !== "undefined" && window.MC_FORM?.open) {
      // @ts-expect-error Mailchimp global
      window.MC_FORM.open();
    }
  };

  const label = {
    en: { ready: "Subscribe to Newsletter", loading: "Loading…" },
    hr: { ready: "Pretplati se na newsletter", loading: "Učitavam…" },
  }[lang];

  return (
    // Issue 23: instead of a silent disabled button, show a loading state
    // so users understand why the button isn't interactive yet.
    <button
      onClick={openPopup}
      disabled={!ready}
      aria-busy={!ready}
      className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition ${
        ready
          ? "bg-pink-600 hover:bg-pink-700 cursor-pointer"
          : "bg-pink-300 cursor-wait"
      }`}
    >
      {ready ? label.ready : label.loading}
    </button>
  );
}
