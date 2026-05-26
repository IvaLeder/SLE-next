import nodemailer from "nodemailer";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

// Loose RFC 5322 email check — server-side guard, not a substitute for real validation.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Defensive caps — prevents abuse (10 MB JSON bodies, etc.) without hurting legit users.
const MAX_NAME    = 100;
const MAX_EMAIL   = 254;        // RFC 5321 hard limit
const MAX_MESSAGE = 5000;       // ~1000 words — plenty for any legitimate inquiry

// ─── Rate limiting ────────────────────────────────────────────────────────
// In-memory sliding window. Lives for the lifetime of the serverless container.
// Trade-off: a cold start resets state, so a determined attacker who triggers
// cold starts could bypass — for a low-traffic blog this is acceptable.
// Upgrade path: swap for Upstash Redis or Vercel KV if abuse becomes real.
const WINDOW_MS = 10 * 60 * 1000;        // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;
const rateLimitStore = new Map<string, number[]>();

function getClientIp(req: Request): string {
  // Vercel/Cloudflare/most proxies put the real IP in x-forwarded-for.
  // Falls back to a stable string so something is rate-limited even locally.
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateLimitStore.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  rateLimitStore.set(ip, hits);

  // Opportunistic GC — drop stale entries to keep memory bounded.
  if (rateLimitStore.size > 1000) {
    for (const [k, ts] of rateLimitStore) {
      if (ts.length === 0 || now - ts[ts.length - 1] > WINDOW_MS) rateLimitStore.delete(k);
    }
  }

  return hits.length > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(req: Request) {
  try {
    // Rate-limit first — cheapest possible reject.
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return Response.json({ error: "Too many requests" }, {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(WINDOW_MS / 1000)) },
      });
    }

    // Reject obviously oversized payloads before parsing.
    const len = Number(req.headers.get("content-length") ?? 0);
    if (len > 20_000) {
      return Response.json({ error: "Payload too large" }, { status: 413 });
    }

    const { name, email, message, token, website } = await req.json();

    // ── Honeypot: real users never fill this; bots fill every input. ──────
    // Return 200 (not 400) so the bot thinks it succeeded and goes away.
    if (typeof website === "string" && website.trim().length > 0) {
      return Response.json({ success: true });
    }

    // ── Validation ─────────────────────────────────────────────────────────
    if (!name || !email || !message || !token) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return Response.json({ error: "Invalid field types" }, { status: 400 });
    }
    if (name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
      return Response.json({ error: "Field exceeds maximum length" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    // ── reCAPTCHA verification ─────────────────────────────────────────────
    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET}&response=${encodeURIComponent(token)}`,
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return Response.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
    }

    // ── Send mail ──────────────────────────────────────────────────────────
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // CRITICAL: `from` MUST be our own authenticated sender (SPF/DKIM aligned).
    // The user's email goes in `replyTo` so we can hit Reply directly.
    // Previously this had `from: email` which got messages caught by spam
    // filters or, worse, treated as a spoofed sender by strict providers.
    await transporter.sendMail({
      from:    process.env.EMAIL_USER,
      to:      process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: email,
      subject: `[Contact form] ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
