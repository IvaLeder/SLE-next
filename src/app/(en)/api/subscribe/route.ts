import crypto from "node:crypto";
import type { Lang } from "@/lib/newsletter";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;

// Where on the site the signup came from. Whitelisted so the Mailchimp tag set
// stays clean; unknown values fall back to the landing-page tag.
const KNOWN_SOURCES = new Set(["subscribe-page", "article", "floating", "footer", "minds"]);
const MAX_NAME = 100;
const DEFAULT_SOURCE = "subscribe-page";

// ─── Rate limiting (own bucket, separate from the contact form) ─────────────
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const rateLimitStore = new Map<string, number[]>();

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateLimitStore.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  rateLimitStore.set(ip, hits);
  if (rateLimitStore.size > 1000) {
    for (const [k, ts] of rateLimitStore) {
      if (ts.length === 0 || now - ts[ts.length - 1] > WINDOW_MS) rateLimitStore.delete(k);
    }
  }
  return hits.length > MAX_REQUESTS_PER_WINDOW;
}

// ─── Mailchimp ──────────────────────────────────────────────────────────────
// One audience per language (the account also has legacy "NO NAME" audiences
// that this flow deliberately ignores; the plan is to merge everything into a
// single tagged audience later). The API key is account-wide, so only the
// audience id varies.
//
// Upserts the address so we never downgrade an existing subscriber, then tags
// it "site-subscribe", the on-site source, and the language. The language tag
// is redundant while the audiences are split, but it means every contact
// carries its own language once the audiences are merged. Double opt-in by
// default (GDPR-friendly): new addresses go in as "pending" and must confirm
// via Mailchimp's email before they're on the marketing list.
async function mailchimpSubscribe(
  email: string,
  source: string,
  firstName: string,
  lastName: string,
  lang: Lang,
): Promise<"ok" | "skipped" | "failed"> {
  const key = process.env.MAILCHIMP_API_KEY;
  const audience =
    lang === "hr" ? process.env.MAILCHIMP_AUDIENCE_ID_HR : process.env.MAILCHIMP_AUDIENCE_ID_EN;
  if (!key || !audience || !key.includes("-")) {
    // Not configured (local dev): let the flow proceed so the pages are
    // testable, but leave a trace — in production this would drop subscribers.
    console.warn("Newsletter subscribe: MAILCHIMP_* env not set, skipping list add");
    return "skipped";
  }

  const dc = key.split("-")[1];
  const hash = crypto.createHash("md5").update(email.toLowerCase()).digest("hex");
  const doubleOptin = (process.env.MAILCHIMP_DOUBLE_OPTIN ?? "true") !== "false";
  const auth = "Basic " + Buffer.from(`anystring:${key}`).toString("base64");
  const base = `https://${dc}.api.mailchimp.com/3.0/lists/${audience}/members/${hash}`;

  // Only send the merge fields the user actually filled in, so an upsert of an
  // existing member never blanks a name Mailchimp already has.
  const mergeFields: Record<string, string> = {};
  if (firstName) mergeFields.FNAME = firstName;
  if (lastName) mergeFields.LNAME = lastName;

  const res = await fetch(base, {
    method: "PUT",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      email_address: email,
      status_if_new: doubleOptin ? "pending" : "subscribed",
      ...(Object.keys(mergeFields).length > 0 && { merge_fields: mergeFields }),
    }),
  });
  if (!res.ok) return "failed";

  // Best-effort tags so the audience can be segmented.
  await fetch(`${base}/tags`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      tags: [
        { name: "site-subscribe", status: "active" },
        { name: source, status: "active" },
        { name: `lang-${lang}`, status: "active" },
      ],
    }),
  }).catch(() => {});

  return "ok";
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return Response.json({ error: "Too many requests", code: "rate_limited" }, {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(WINDOW_MS / 1000)) },
      });
    }

    const len = Number(req.headers.get("content-length") ?? 0);
    if (len > 20_000) {
      return Response.json({ error: "Payload too large", code: "too_large" }, { status: 413 });
    }

    const { email, consent, token, website, source, firstName, lastName, lang } = await req.json();

    // Honeypot — bots fill every field; return a fake success.
    if (typeof website === "string" && website.trim().length > 0) {
      return Response.json({ success: true });
    }

    if (!token) {
      return Response.json({ error: "Missing reCAPTCHA token", code: "recaptcha_failed" }, { status: 400 });
    }
    if (typeof email !== "string" || !email) {
      return Response.json({ error: "Missing email", code: "missing_fields" }, { status: 400 });
    }
    if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
      return Response.json({ error: "Invalid email", code: "invalid_email" }, { status: 400 });
    }
    if (consent !== true) {
      return Response.json({ error: "Consent required", code: "consent_required" }, { status: 400 });
    }
    const safeSource =
      typeof source === "string" && KNOWN_SOURCES.has(source) ? source : DEFAULT_SOURCE;
    const safeFirst = typeof firstName === "string" ? firstName.trim().slice(0, MAX_NAME) : "";
    const safeLast = typeof lastName === "string" ? lastName.trim().slice(0, MAX_NAME) : "";
    // Anything unrecognised goes to the EN list rather than being rejected: a
    // stale cached bundle posting without `lang` should still subscribe.
    const safeLang: Lang = lang === "hr" ? "hr" : "en";

    // reCAPTCHA
    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET}&response=${encodeURIComponent(token)}`,
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return Response.json({ error: "reCAPTCHA verification failed", code: "recaptcha_failed" }, { status: 400 });
    }

    // Unlike the old e-book route there's no fallback delivery here: the whole
    // point is the list add, so a Mailchimp failure is a real error the user
    // should see (and retry) rather than a silent no-op "success".
    const result = await mailchimpSubscribe(email, safeSource, safeFirst, safeLast, safeLang);
    if (result === "failed") {
      return Response.json({ error: "Subscription failed", code: "send_failed" }, { status: 502 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return Response.json({ error: "Something went wrong", code: "send_failed" }, { status: 500 });
  }
}
