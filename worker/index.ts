// Cloudflare Worker in front of the static site in out/.
//
// Cloudflare serves every file in out/ directly, without running this code
// (that's what keeps hosting free). The Worker only runs for:
//   • "/"             → language redirect (was src/proxy.ts on Vercel)
//   • "/api/*"        → contact form + newsletter signup
//   • "/{en,hr}/draft/*" → token-gated draft previews
//   • any URL with no matching file → the 774 redirects from next.config.ts
//     (same regexes, same order as Vercel), then a language-specific 404.
//
// Routing data comes from worker/generated/routes.json, written after each
// build by scripts/cloudflare/build-routing.mts.

import routes from "./generated/routes.json";
import { POST as contact } from "./api/contact";
import { POST as subscribe } from "./api/subscribe";

type Assets = { fetch(input: Request | URL | string, init?: RequestInit): Promise<Response> };
type Env = { ASSETS: Assets };
type CfRequest = Request & { cf?: { country?: string } };

type Redirect = { regex: string; keys: string[]; destination: string; status: number };
type HeaderRule = { source: string; regex: string; headers: { key: string; value: string }[] };

// Vercel's cache header on redirects and other generated responses.
const NO_CACHE = "public, max-age=0, must-revalidate";

// Compiled once per isolate, on first use.
let redirectTable: { re: RegExp; r: Redirect }[] | null = null;
let headerTable: { re: RegExp; h: HeaderRule }[] | null = null;
const getRedirects = () =>
  (redirectTable ??= (routes.redirects as Redirect[]).map((r) => ({ re: new RegExp(r.regex, routes.flags), r })));
const getHeaderRules = () =>
  (headerTable ??= (routes.headers as HeaderRule[]).map((h) => ({ re: new RegExp(h.regex, routes.flags), h })));

/** Apply next.config.ts headers() to a response this Worker produces. */
function withSiteHeaders(res: Response, pathname: string): Response {
  const out = new Response(res.body, res);
  for (const { re, h } of getHeaderRules()) {
    if (re.test(pathname)) for (const { key, value } of h.headers) out.headers.set(key, value);
  }
  return out;
}

function redirect(location: string, status: number, pathname: string): Response {
  return withSiteHeaders(
    new Response(null, {
      status,
      headers: { Location: location, "Cache-Control": NO_CACHE, "Content-Type": "text/plain" },
    }),
    pathname,
  );
}

// ─── "/" → /en or /hr ────────────────────────────────────────────────────────

/**
 * Language tags from an Accept-Language header, most-preferred first.
 * "en-US,hr;q=0.9,de;q=0.8" → ["en-us", "hr", "de"]. Sort is stable, so tags
 * sharing a q-value keep the order the browser sent them in.
 */
function preferredTags(header: string): string[] {
  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return {
        tag: tag.trim().toLowerCase(),
        q: q ? Number.parseFloat(q.split("=")[1]) || 0 : 1,
      };
    })
    .filter((entry) => entry.tag)
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.tag);
}

function homeRedirect(req: CfRequest): Response {
  // Device language decides, because that is what actually says whether a
  // reader *can* read English. Croatian wins only when it outranks English
  // in the browser's own ordered list, so "en-GB,hr" still gets English.
  // Cloudflare's country is a tiebreaker for the rare visitor whose
  // languages mention neither (e.g. a German-only phone in Croatia).
  const tags = preferredTags(req.headers.get("accept-language") ?? "");
  const hr = tags.findIndex((t) => t.startsWith("hr"));
  const en = tags.findIndex((t) => t.startsWith("en"));
  const wantsCroatian =
    hr !== -1 ? en === -1 || hr < en : en === -1 && req.cf?.country === "HR";
  return redirect(wantsCroatian ? "/hr" : "/en", 307, "/");
}

// ─── Redirects from next.config.ts ─────────────────────────────────────────

function fillDestination(destination: string, params: Record<string, string | undefined>): string {
  // "/:lang/:path*" with path missing → "/en"; "/images/posts/:name.:ext" → filled.
  return destination.replace(/(\/?):([A-Za-z0-9_]+)(?:\([^)]*\))?([*+?])?/g, (_m, slash: string, name: string) => {
    const value = params[name];
    return value === undefined || value === "" ? "" : `${slash}${value}`;
  });
}

function matchRedirect(url: URL): Response | null {
  let decoded = url.pathname;
  try {
    decoded = decodeURIComponent(url.pathname);
  } catch {
    // Malformed escape: match the raw path only.
  }
  const candidates = decoded === url.pathname ? [url.pathname] : [url.pathname, decoded];
  for (const { re, r } of getRedirects()) {
    for (const path of candidates) {
      const m = re.exec(path);
      if (!m) continue;
      const params: Record<string, string | undefined> = {};
      r.keys.forEach((key, i) => (params[key] = m[i + 1]));
      // Like Vercel: keep the visitor's query string (utm tags etc.).
      return redirect(fillDestination(r.destination, params) + url.search, r.status, url.pathname);
    }
  }
  return null;
}

/**
 * Non-ASCII URL guard (ported from src/proxy.ts). Some old WordPress
 * permalinks contained non-ASCII characters (e.g. the Pi article was
 * /en/explore-number-pi-π). No valid route uses them, so strip them and 308
 * to the cleaned path: that recovers the real article for the Pi case and
 * cleanly 404s anything else.
 */
function nonAsciiRedirect(url: URL): Response | null {
  let decoded = url.pathname;
  try {
    decoded = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }
  if (![...decoded].some((c) => c.charCodeAt(0) > 127)) return null;
  const cleaned = [...decoded]
    .filter((c) => c.charCodeAt(0) <= 127)
    .join("")
    .replace(/-{2,}/g, "-") // collapse the double dashes stripping may leave
    .replace(/-(\/|$)/g, "$1"); // trim a trailing dash per path segment
  if (!cleaned || cleaned === "/" || cleaned === decoded) return null;
  return redirect(cleaned + url.search, 308, url.pathname);
}

// ─── 404s ──────────────────────────────────────────────────────────────────

async function notFound(req: Request, url: URL, env: Env): Promise<Response> {
  // /en/… and /hr/… get the page in their own language (/en/404, /hr/404);
  // anything else gets Next's generic 404.html, as on Vercel.
  const lang = url.pathname.match(/^\/(en|hr)(?:\/|$)/i)?.[1]?.toLowerCase();
  const page = await env.ASSETS.fetch(new URL(lang ? `/${lang}/404` : "/404", url));
  const res = new Response(req.method === "HEAD" ? null : page.body, {
    status: 404,
    headers: page.headers,
  });
  res.headers.set("Cache-Control", NO_CACHE);
  return withSiteHeaders(res, url.pathname);
}

// ─── Drafts ────────────────────────────────────────────────────────────────

const DRAFT_LINK = /^\/(en|hr)\/draft\/([A-Za-z0-9_-]{1,200})$/;
const TOKEN = /^[A-Za-z0-9_-]{1,200}$/;

async function draft(req: Request, url: URL, env: Env): Promise<Response> {
  // Shared links look like /en/draft/<slug>?key=<previewToken>; the page
  // itself is the static file /en/draft/<slug>/<previewToken>.
  const link = url.pathname.match(DRAFT_LINK);
  const key = url.searchParams.get("key") ?? "";
  let res: Response;
  if (link) {
    if (!TOKEN.test(key)) return notFound(req, url, env);
    res = await env.ASSETS.fetch(new Request(new URL(`/${link[1]}/draft/${link[2]}/${key}`, url), req));
  } else {
    res = await env.ASSETS.fetch(req);
  }
  if (res.status === 404) return notFound(req, url, env);
  return withSiteHeaders(res, url.pathname);
}

// ─── API ───────────────────────────────────────────────────────────────────

const API: Record<string, (req: Request) => Promise<Response>> = {
  "/api/contact": contact,
  "/api/subscribe": subscribe,
};

async function api(req: Request, url: URL, env: Env): Promise<Response> {
  const handler = API[url.pathname];
  if (!handler) return notFound(req, url, env);
  if (req.method !== "POST") {
    return withSiteHeaders(
      new Response(null, { status: 405, headers: { Allow: "POST", "Cache-Control": NO_CACHE } }),
      url.pathname,
    );
  }
  const res = await handler(req);
  res.headers.set("Cache-Control", "private, no-store");
  return withSiteHeaders(res, url.pathname);
}

// ─── Entry ─────────────────────────────────────────────────────────────────

const BLOCKED = new Set(["/wp-login.php", "/xmlrpc.php"]);

const worker = {
  async fetch(req: CfRequest, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const { pathname } = url;

    if (pathname === "/") return homeRedirect(req);
    if (pathname.startsWith("/api/")) return api(req, url, env);
    if (/^\/(en|hr)\/draft\//.test(pathname)) return draft(req, url, env);

    // WordPress login probes: Vercel's firewall answered these with 403.
    if (BLOCKED.has(pathname.toLowerCase())) {
      return withSiteHeaders(
        new Response("Forbidden", { status: 403, headers: { "Content-Type": "text/plain;charset=utf-8" } }),
        pathname,
      );
    }

    // Everything else only reaches the Worker when no file matched.
    return matchRedirect(url) ?? nonAsciiRedirect(url) ?? notFound(req, url, env);
  },
};

export default worker;
