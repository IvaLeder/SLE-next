"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Mailchimp hosted-audience identifiers. These are PUBLIC values — they ride in
// the plain subscribe URL and in every hosted form's HTML — so shipping them to
// the client is fine. One source of truth for the JSONP submit below.
const MC = {
  domain: "stemlittleexplorers.us15.list-manage.com",
  u: "375a897a3f9418343fcbaf481",
  id: "aef7a43083",
};

const T = {
  en: {
    emailLabel: "Email address",
    placeholder: "you@example.com",
    button: "Subscribe",
    sending: "Subscribing…",
    error: "We couldn't sign you up just now — check the address and try again.",
  },
  hr: {
    emailLabel: "Email adresa",
    placeholder: "vi@primjer.com",
    button: "Pretplati se",
    sending: "Pretplaćujem…",
    error:
      "Trenutačno vas ne možemo pretplatiti — provjerite adresu i pokušajte ponovo.",
  },
} as const;

/**
 * Subscribe an email to the Mailchimp list.
 *
 * Mailchimp's hosted list doesn't send CORS headers, so a normal fetch to its
 * subscribe endpoint is blocked by the browser. Its `post-json` endpoint instead
 * supports JSONP: we inject a <script> whose querystring carries the fields plus
 * a `c` callback name, and Mailchimp responds by calling window[c]({ result }).
 * `result` is "success" (added / pending double-opt-in) or "error" (bad or
 * already-subscribed address).
 */
function mailchimpSubscribe(email: string): Promise<"success" | "error"> {
  return new Promise((resolve) => {
    const cb = `mc_cb_${Date.now()}`;
    const script = document.createElement("script");
    const w = window as unknown as Record<string, unknown>;

    const finish = (r: "success" | "error") => {
      delete w[cb];
      script.remove();
      resolve(r);
    };

    w[cb] = (data: { result?: string }) =>
      finish(data?.result === "success" ? "success" : "error");

    const params = new URLSearchParams({ u: MC.u, id: MC.id, EMAIL: email, c: cb });
    script.src = `https://${MC.domain}/subscribe/post-json?${params.toString()}`;
    script.onerror = () => finish("error");
    document.body.appendChild(script);
  });
}

/**
 * Inline newsletter signup. Submits to Mailchimp in-page (no tab switch), then
 * fires a GTM event and forwards to the localized /thank-you page — that
 * pageview is the conversion we track.
 */
export function SubscribeForm({ lang = "en" }: { lang?: "en" | "hr" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const router = useRouter();
  const t = T[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");

    const result = await mailchimpSubscribe(email).catch(() => "error" as const);

    if (result === "success") {
      window.dataLayer?.push({ event: "newsletter_subscribe", lang });
      router.push(`/${lang}/thank-you`);
      return;
    }
    setStatus("error");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full font-sans" noValidate>
      <label htmlFor={`sub-email-${lang}`} className="sr-only">
        {t.emailLabel}
      </label>
      <div className="flex flex-col gap-2">
        <input
          id={`sub-email-${lang}`}
          type="email"
          name="EMAIL"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder={t.placeholder}
          autoComplete="email"
          inputMode="email"
          className="w-full min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-newsletter"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="px-4 py-2 rounded-lg bg-newsletter hover:bg-newsletter-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {status === "submitting" ? t.sending : t.button}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-700" role="alert">
          {t.error}
        </p>
      )}
    </form>
  );
}
