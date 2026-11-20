import { WorkerMailer } from "worker-mailer";

// Contact form endpoint, served by the Cloudflare Worker (worker/index.ts) at
// POST /api/contact. Secrets come from `process.env`, which the Worker's
// nodejs_compat flag fills from its environment variables and secrets.

// Loose RFC 5322 email check — server-side guard, not a substitute for real validation.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Defensive caps — prevents abuse (10 MB JSON bodies, etc.) without hurting legit users.
const MAX_NAME    = 100;
const MAX_EMAIL   = 254;        // RFC 5321 hard limit
const MAX_MESSAGE = 5000;       // ~1000 words — plenty for any legitimate inquiry

// ─── Rate limiting ────────────────────────────────────────────────────────
// In-memory sliding window. Lives for the lifetime of the Worker isolate.
// Trade-off: a fresh isolate resets state, so a determined attacker could
// bypass it — for a low-traffic blog this is acceptable.
// Upgrade path: Cloudflare's Rate Limiting binding if abuse becomes real.
const WINDOW_MS = 10 * 60 * 1000;        // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;
const rateLimitStore = new Map<string, number[]>();

function getClientIp(req: Request): string {
  // Cloudflare puts the visitor's IP in cf-connecting-ip; x-forwarded-for
  // covers other proxies. Falls back to a stable string so something is
  // rate-limited even locally.
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
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
      return Response.json({ error: "Too many requests", code: "rate_limited" }, {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(WINDOW_MS / 1000)) },
      });
    }

    // Reject obviously oversized payloads before parsing.
    const len = Number(req.headers.get("content-length") ?? 0);
    if (len > 20_000) {
      return Response.json({ error: "Payload too large", code: "too_large" }, { status: 413 });
    }

    const { name, email, message, token, website } = await req.json();

    // ── Honeypot: real users never fill this; bots fill every input. ──────
    // Return 200 (not 400) so the bot thinks it succeeded and goes away.
    if (typeof website === "string" && website.trim().length > 0) {
      return Response.json({ success: true });
    }

    // ── Validation ─────────────────────────────────────────────────────────
    // A missing reCAPTCHA token is its own case — usually means the widget
    // failed to issue one (e.g. unlisted domain), so flag it distinctly.
    if (!token) {
      return Response.json({ error: "Missing reCAPTCHA token", code: "recaptcha_failed" }, { status: 400 });
    }
    if (!name || !email || !message) {
      return Response.json({ error: "Missing required fields", code: "missing_fields" }, { status: 400 });
    }
    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return Response.json({ error: "Invalid field types", code: "invalid_fields" }, { status: 400 });
    }
    if (name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
      return Response.json({ error: "Field exceeds maximum length", code: "too_long" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: "Invalid email", code: "invalid_email" }, { status: 400 });
    }

    // ── reCAPTCHA verification ─────────────────────────────────────────────
    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${encodeURIComponent(token)}`,
    });
    const verifyData: { success?: boolean } = await verifyRes.json();
    if (!verifyData.success) {
      return Response.json({ error: "reCAPTCHA verification failed", code: "recaptcha_failed" }, { status: 400 });
    }

    // ── Send mail ──────────────────────────────────────────────────────────
    // Gmail SMTP over implicit TLS (port 465) with the same account + app
    // password as before. Workers can't open port 25, but 465/587 are fine.
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!user || !pass) {
      console.error("Contact form configuration is missing", { hasUser: Boolean(user), hasPass: Boolean(pass) });
      return Response.json({ error: "Failed to send message", code: "send_failed" }, { status: 500 });
    }

    // CRITICAL: `from` MUST be our own authenticated sender (SPF/DKIM aligned).
    // The user's email goes in `reply` (Reply-To) so we can hit Reply directly.
    // Previously this had `from: email` which got messages caught by spam
    // filters or, worse, treated as a spoofed sender by strict providers.
    // Newlines never belong in a header value (header-injection guard); the
    // raw name still appears intact in the body below.
    const subjectName = name.replace(/[\r\n]+/g, " ").trim();

    await WorkerMailer.send(
      {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        credentials: { username: user, password: pass },
        authType: "plain",
      },
      {
        from:    user,
        to:      process.env.EMAIL_TO || user,
        reply:   email,
        subject: `[Contact form] ${subjectName}`,
        text:    `From: ${name} <${email}>\n\n${message}`,
      },
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return Response.json({ error: "Failed to send message", code: "send_failed" }, { status: 500 });
  }
}
