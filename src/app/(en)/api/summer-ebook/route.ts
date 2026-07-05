import nodemailer from "nodemailer";
import crypto from "node:crypto";
import { siteConfig } from "@/config/site";
import { SUMMER_PDF, type Lang } from "@/lib/summer-ebook";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;

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

// ─── Mailchimp (optional — skipped cleanly when unconfigured) ────────────────
// Upserts the address so we never downgrade an existing subscriber, then tags
// it "summer-ebook". Double opt-in by default (GDPR-friendly): new addresses go
// in as "pending" and must confirm via Mailchimp's email before they're on the
// marketing list. The e-book itself is delivered regardless (below), as the
// transactional fulfilment of their request.
async function mailchimpSubscribe(email: string): Promise<void> {
  const key = process.env.MAILCHIMP_API_KEY;
  const audience = process.env.MAILCHIMP_AUDIENCE_ID;
  if (!key || !audience || !key.includes("-")) return; // not configured

  const dc = key.split("-")[1];
  const hash = crypto.createHash("md5").update(email.toLowerCase()).digest("hex");
  const doubleOptin = (process.env.MAILCHIMP_DOUBLE_OPTIN ?? "true") !== "false";
  const auth = "Basic " + Buffer.from(`anystring:${key}`).toString("base64");
  const base = `https://${dc}.api.mailchimp.com/3.0/lists/${audience}/members/${hash}`;

  await fetch(base, {
    method: "PUT",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      email_address: email,
      status_if_new: doubleOptin ? "pending" : "subscribed",
    }),
  });
  // Best-effort tag so the audience can be segmented.
  await fetch(`${base}/tags`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ tags: [{ name: "summer-ebook", status: "active" }] }),
  });
}

// ─── Delivery email ─────────────────────────────────────────────────────────
const EMAIL_COPY: Record<Lang, { subject: string; greeting: string; body: string; cta: string; sign: string }> = {
  en: {
    subject: "Your free Summer of curiosity e-book ☀️",
    greeting: "Hi there,",
    body: "Thanks for grabbing Summer of curiosity — your free e-book of screen-free summer STEM activities, sorted by age. Download it here:",
    cta: "Download the e-book",
    sign: "Have a wonderful, curious summer!\n— STEM Little Explorers",
  },
  hr: {
    subject: "Vaša besplatna e-knjiga Ljeto znatiželje ☀️",
    greeting: "Bok,",
    body: "Hvala što ste preuzeli Ljeto znatiželje — besplatnu e-knjigu ljetnih STEM aktivnosti bez ekrana, posloženih po dobi. Preuzmite je ovdje:",
    cta: "Preuzmite e-knjigu",
    sign: "Želimo vam predivno, znatiželjno ljeto!\n— STEM Little Explorers",
  },
};

async function sendEbookEmail(email: string, lang: Lang): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return; // not configured
  const c = EMAIL_COPY[lang];
  const url = `${siteConfig.url}${SUMMER_PDF[lang]}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: c.subject,
    text: `${c.greeting}\n\n${c.body}\n${url}\n\n${c.sign}\n${siteConfig.url}`,
    html: `<p>${c.greeting}</p><p>${c.body}</p><p><a href="${url}" style="display:inline-block;background:#FB6F52;color:#fff;text-decoration:none;padding:10px 20px;border-radius:24px;font-weight:600">${c.cta}</a></p><p style="white-space:pre-line">${c.sign}</p><p><a href="${siteConfig.url}">${siteConfig.url.replace(/^https?:\/\//, "")}</a></p>`,
  });
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

    const { email, lang, consent, token, website } = await req.json();

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

    // Subscribe + deliver. Both are best-effort: the client also reveals a direct
    // download on success, so a Mailchimp/SMTP hiccup never blocks the user.
    await Promise.allSettled([mailchimpSubscribe(email), sendEbookEmail(email, safeLang)]);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Summer e-book signup error:", error);
    return Response.json({ error: "Something went wrong", code: "send_failed" }, { status: 500 });
  }
}
