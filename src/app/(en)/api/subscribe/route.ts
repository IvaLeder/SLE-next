import crypto from "node:crypto";
import type { Lang } from "@/lib/newsletter";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;

// Where on the site the signup came from. Whitelisted so the Mailchimp tag set
// stays clean; unknown values fall back to the landing-page tag.
const KNOWN_SOURCES = new Set(["subscribe-page", "home", "article", "floating", "footer", "minds"]);
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
type MailchimpOutcome =
  | "confirmation_sent"
  | "subscribed"
  | "already_subscribed"
  | "confirmation_pending";

type MailchimpResult =
  | { ok: true; outcome: MailchimpOutcome; memberStatus: string }
  | { ok: false; code: "configuration_error" | "address_unavailable" | "send_failed" };

type MailchimpErrorBody = { title?: unknown; type?: unknown };

async function logMailchimpFailure(
  operation: string,
  res: Response,
  level: "error" | "warning" = "error",
) {
  const data: MailchimpErrorBody = await res.json().catch(() => ({}));
  // Deliberately omit the response `detail`: Mailchimp sometimes includes the
  // submitted address there. These fields are enough to diagnose auth, list-id
  // and member-state failures without putting subscriber data in Vercel logs.
  const log = level === "warning" ? console.warn : console.error;
  log("Newsletter Mailchimp request failed", {
    operation,
    httpStatus: res.status,
    mailchimpTitle: typeof data.title === "string" ? data.title.slice(0, 120) : undefined,
    mailchimpType: typeof data.type === "string" ? data.type.slice(0, 160) : undefined,
    requestId: res.headers.get("x-request-id") ?? undefined,
  });
}

async function tagMailchimpMember(
  base: string,
  auth: string,
  source: string,
  lang: Lang,
) {
  try {
    const res = await fetch(`${base}/tags`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        tags: [
          { name: "site-subscribe", status: "active" },
          { name: source, status: "active" },
          { name: `lang-${lang}`, status: "active" },
        ],
      }),
    });
    if (!res.ok) await logMailchimpFailure("tag_member", res, "warning");
  } catch {
    // Tags are useful attribution, but a transient tag failure must not turn a
    // successful subscription into a failure. Keep it visible in logs.
    console.warn("Newsletter Mailchimp tag request failed", { source, lang });
  }
}

// Check the current member state before updating. `status_if_new` only affects
// new contacts, so without this step a repeat pending/subscribed address would
// return 200 even though Mailchimp sends no new confirmation email.
async function mailchimpSubscribe(
  email: string,
  source: string,
  firstName: string,
  lastName: string,
  lang: Lang,
): Promise<MailchimpResult> {
  const key = process.env.MAILCHIMP_API_KEY;
  const audience =
    lang === "hr" ? process.env.MAILCHIMP_AUDIENCE_ID_HR : process.env.MAILCHIMP_AUDIENCE_ID_EN;
  if (!key || !audience || !key.includes("-")) {
    console.error("Newsletter configuration is missing or malformed", {
      hasApiKey: Boolean(key),
      apiKeyHasDataCenter: Boolean(key?.includes("-")),
      hasAudienceId: Boolean(audience),
      lang,
    });
    return { ok: false, code: "configuration_error" };
  }

  const dc = key.split("-")[1];
  const hash = crypto.createHash("md5").update(email.toLowerCase()).digest("hex");
  const doubleOptin = (process.env.MAILCHIMP_DOUBLE_OPTIN ?? "true") !== "false";
  const targetStatus = doubleOptin ? "pending" : "subscribed";
  const auth = "Basic " + Buffer.from(`anystring:${key}`).toString("base64");
  const base = `https://${dc}.api.mailchimp.com/3.0/lists/${audience}/members/${hash}`;

  let existingStatus: string | null = null;
  try {
    const memberRes = await fetch(base, { headers: { Authorization: auth } });
    if (memberRes.ok) {
      const member: { status?: unknown } = await memberRes.json();
      existingStatus = typeof member.status === "string" ? member.status : "unknown";
    } else if (memberRes.status !== 404) {
      await logMailchimpFailure("get_member", memberRes);
      return { ok: false, code: "send_failed" };
    }
  } catch {
    console.error("Newsletter Mailchimp request failed", { operation: "get_member", reason: "network" });
    return { ok: false, code: "send_failed" };
  }

  if (existingStatus === "cleaned") {
    console.info("Newsletter signup resolved", { outcome: "address_unavailable", source, lang });
    return { ok: false, code: "address_unavailable" };
  }

  // Only send the merge fields the user actually filled in, so an upsert of an
  // existing member never blanks a name Mailchimp already has.
  const mergeFields: Record<string, string> = {};
  if (firstName) mergeFields.FNAME = firstName;
  if (lastName) mergeFields.LNAME = lastName;

  // Existing unsubscribed/transactional contacts explicitly asked to join
  // again, so move them through the opt-in flow. Existing subscribed/pending
  // contacts keep their status; the PUT only updates supplied merge fields.
  const shouldSetStatus =
    existingStatus !== null &&
    existingStatus !== "subscribed" &&
    existingStatus !== "pending";

  let memberStatus = existingStatus ?? targetStatus;
  try {
    const res = await fetch(base, {
      method: "PUT",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        email_address: email,
        status_if_new: targetStatus,
        ...(shouldSetStatus && { status: targetStatus }),
        ...(Object.keys(mergeFields).length > 0 && { merge_fields: mergeFields }),
      }),
    });
    if (!res.ok) {
      await logMailchimpFailure("put_member", res);
      return { ok: false, code: "send_failed" };
    }
    const member: { status?: unknown } = await res.json();
    if (typeof member.status === "string") memberStatus = member.status;
  } catch {
    console.error("Newsletter Mailchimp request failed", { operation: "put_member", reason: "network" });
    return { ok: false, code: "send_failed" };
  }

  await tagMailchimpMember(base, auth, source, lang);

  const outcome: MailchimpOutcome =
    existingStatus === "subscribed"
      ? "already_subscribed"
      : existingStatus === "pending"
        ? "confirmation_pending"
        : doubleOptin
          ? "confirmation_sent"
          : "subscribed";

  console.info("Newsletter signup resolved", { outcome, memberStatus, source, lang });
  return { ok: true, outcome, memberStatus };
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
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecret) {
      console.error("Newsletter configuration is missing", { hasRecaptchaSecret: false });
      return Response.json(
        { error: "Newsletter is temporarily unavailable", code: "configuration_error" },
        { status: 503 },
      );
    }
    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${recaptchaSecret}&response=${encodeURIComponent(token)}`,
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return Response.json({ error: "reCAPTCHA verification failed", code: "recaptcha_failed" }, { status: 400 });
    }

    // Unlike the old e-book route there's no fallback delivery here: the whole
    // point is the list add, so a Mailchimp failure is a real error the user
    // should see (and retry) rather than a silent no-op "success".
    const result = await mailchimpSubscribe(email, safeSource, safeFirst, safeLast, safeLang);
    if (!result.ok) {
      const status = result.code === "configuration_error" ? 503 : result.code === "address_unavailable" ? 409 : 502;
      return Response.json({ error: "Subscription failed", code: result.code }, { status });
    }

    return Response.json({ success: true, code: result.outcome });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return Response.json({ error: "Something went wrong", code: "send_failed" }, { status: 500 });
  }
}
