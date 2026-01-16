"use client";
import {useState, useEffect} from "react";

export function SubscribeButton() {
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
    } else {
      console.warn("Mailchimp popup not loaded yet");
    }
  };

  return (
    <button disabled={!ready}
      onClick={openPopup}
      className="px-4 py-2 rounded-lg bg-pink-600 text-white font-medium hover:bg-pink-700 transition"
    >
      Subscribe to Newsletter
    </button>
  );
}