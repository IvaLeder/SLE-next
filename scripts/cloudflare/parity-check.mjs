#!/usr/bin/env node
// Compares two deployments of the site URL by URL, so the Cloudflare copy can
// be proven identical to the live Vercel site before (and after) the DNS switch.
//
//   node scripts/cloudflare/parity-check.mjs \
//     --a https://stemlittleexplorers.com --b http://127.0.0.1:8787 [--out report.json]
//
// URLs checked:
//   • every <loc> in A's sitemap.xml, plus its trailing-slash variant
//   • every redirect source from .next/routes-manifest.json (static ones
//     verbatim, regex ones via sample URLs below)
//   • every same-origin image/PDF/script/stylesheet the sitemap pages use
//   • a hand-written list of special cases (root, feeds, 404s, API, drafts…)
// For each URL: status, Location, Content-Type, X-Robots-Tag; for HTML pages
// also title, meta description, robots, canonical, hreflang, og:*, JSON-LD
// and the visible text; for other 200s the body's SHA-256.
// Build-specific noise (chunk hashes, deployment ids) is ignored.

import crypto from "node:crypto";
import fs from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, v, i, all) => (v.startsWith("--") ? [...acc, [v.slice(2), all[i + 1]]] : acc), []),
);
const A = (args.a ?? "https://stemlittleexplorers.com").replace(/\/$/, "");
const B = (args.b ?? "http://127.0.0.1:8787").replace(/\/$/, "");
const OUT = args.out;
const CONCURRENCY = Number(args.concurrency ?? 6);
const SITE = "https://stemlittleexplorers.com";

// ─── HTTP ───────────────────────────────────────────────────────────────────
async function get(base, path, attempt = 1) {
  try {
    const res = await fetch(base + path, { redirect: "manual", headers: { "accept-language": "en-US,en;q=0.9" } });
    const buf = Buffer.from(await res.arrayBuffer());
    return { status: res.status, headers: res.headers, body: buf };
  } catch (error) {
    if (attempt < 3) return get(base, path, attempt + 1);
    return { status: 0, headers: new Headers(), body: Buffer.alloc(0), error: String(error) };
  }
}

async function pool(items, fn) {
  const results = new Array(items.length);
  let next = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
        if (++done % 200 === 0) process.stderr.write(`  ${done}/${items.length}\n`);
      }
    }),
  );
  return results;
}

// ─── HTML fingerprint ─────────────────────────────────────────────────────
const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`, "i"))?.[1];
function metaTags(html) {
  const out = {};
  for (const tag of html.match(/<meta\s[^>]*>/gi) ?? []) {
    const key = attr(tag, "name") ?? attr(tag, "property");
    if (!key) continue;
    if (/^(next-size-adjust|viewport)$/.test(key)) continue;
    (out[key] ??= []).push(attr(tag, "content") ?? "");
  }
  return out;
}
function linkTags(html) {
  return (html.match(/<link\s[^>]*>/gi) ?? [])
    .filter((t) => /rel="(canonical|alternate)"/i.test(t))
    .map((t) => `${attr(t, "rel")} ${attr(t, "hreflang") ?? ""} ${attr(t, "href")}`)
    .sort();
}
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<template[\s\S]*?<\/template>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (e) => e)
    .replace(/\s+/g, " ")
    .trim();
}
function jsonLd(html) {
  return (html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) ?? []).map((s) =>
    s.replace(/<[^>]+>/g, "").trim(),
  );
}
function fingerprint(html) {
  return {
    lang: html.match(/<html[^>]*\slang="([^"]*)"/i)?.[1] ?? "",
    title: html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "",
    meta: metaTags(html),
    links: linkTags(html),
    jsonLd: jsonLd(html),
    h1: (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) ?? []).map((h) => visibleText(h)),
    textHash: crypto.createHash("sha256").update(visibleText(html)).digest("hex").slice(0, 16),
    textLength: visibleText(html).length,
  };
}
const sha = (buf) => crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);

// Build-time noise that legitimately differs between two builds of the same
// commit: generated-image cache busters (?<hash>), sitemap/RSS timestamps.
const stripImageHash = (v) => v.replace(/(opengraph-image|twitter-image|icon|apple-icon)(-[a-z0-9]+)\?[0-9a-f]+/g, "$1$2");
function normalizeXml(text) {
  return text
    .replace(/<lastmod>\d{4}-\d\d-\d\dT[\d:.]+Z<\/lastmod>/g, "<lastmod>BUILD</lastmod>")
    .replace(/<lastBuildDate>[^<]*<\/lastBuildDate>/g, "<lastBuildDate>BUILD</lastBuildDate>");
}

function summarize(r) {
  // Cloudflare's asset server sends text/html and text/plain without
  // "; charset=utf-8". Harmless while every page declares <meta charSet> in
  // its first 1024 bytes (checked below as page.metaCharset), so compare the
  // media type alone.
  const type = (r.headers.get("content-type") ?? "").replace(/\s+/g, "").replace(/;charset=utf-8$/i, "");
  const redirect = r.status >= 300 && r.status < 400;
  const s = {
    status: r.status,
    location: r.headers.get("location") ?? "",
    // A redirect's body type is irrelevant to browsers and crawlers.
    type: redirect ? "" : type,
    robots: r.headers.get("x-robots-tag") ?? "",
  };
  if (r.status === 200) {
    if (type.startsWith("text/html")) {
      s.page = fingerprint(r.body.toString("utf8"));
      s.page.metaCharset = /<meta charset="utf-8"/i.test(r.body.subarray(0, 1024).toString("latin1"));
      for (const k of ["og:image", "twitter:image"]) {
        if (s.page.meta[k]) s.page.meta[k] = s.page.meta[k].map(stripImageHash);
      }
      s.page.jsonLd = s.page.jsonLd.map(stripImageHash);
    } else if (/xml/.test(type)) {
      s.bodyHash = sha(Buffer.from(normalizeXml(r.body.toString("utf8"))));
    } else {
      s.bodyHash = sha(r.body);
    }
  }
  if (r.error) s.error = r.error;
  return s;
}

/** Follow a redirect chain (max 6 hops) and return the final path + status. */
async function finalHop(base, path) {
  let current = path;
  for (let hop = 0; hop < 6; hop++) {
    const r = await get(base, current);
    const loc = r.headers.get("location");
    if (r.status < 300 || r.status >= 400 || !loc) return { path: current, status: r.status, hops: hop };
    current = toPath(new URL(loc, base + current).href.replace(base, ""));
  }
  return { path: current, status: "loop", hops: 6 };
}

// Differences that are intended, with the reason. Anything else fails.
const ACCEPTED = [
  { path: /^\/search-(en|hr)\.json$/, reason: "new file: search runs in the browser on Cloudflare" },
];

function diff(a, b, prefix = "") {
  const out = [];
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  for (const k of keys) {
    const va = a?.[k];
    const vb = b?.[k];
    if (va && vb && typeof va === "object" && !Array.isArray(va)) out.push(...diff(va, vb, `${prefix}${k}.`));
    else if (JSON.stringify(va) !== JSON.stringify(vb)) out.push({ field: prefix + k, a: va, b: vb });
  }
  return out;
}

// ─── URL list ─────────────────────────────────────────────────────────────
const toPath = (u) => u.replace(SITE, "").replace(/^https?:\/\/[^/]+/, "") || "/";

const sitemap = (await get(A, "/sitemap.xml")).body.toString("utf8");
const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => toPath(m[1]));
const pagePaths = [...new Set(sitemapPaths.filter((p) => !/\.(jpe?g|png|webp|avif|gif|svg|pdf)$/i.test(p)))];

const manifest = JSON.parse(fs.readFileSync(".next/routes-manifest.json", "utf8"));
const redirectSources = manifest.redirects
  .filter((r) => !r.internal && !/[:*(]/.test(r.source))
  .map((r) => r.source.replace(/[^\x00-\x7f]/g, (c) => encodeURIComponent(c)));

const special = [
  "/", "/robots.txt", "/ads.txt", "/sitemap.xml", "/manifest.webmanifest", "/favicon.ico",
  "/rss-en.xml", "/rss-hr.xml", "/rss-en-science.xml", "/rss-hr-math.xml",
  "/en/does-not-exist", "/hr/ne-postoji", "/does-not-exist", "/en/category/nope", "/EN",
  "/api/contact", "/api/subscribe", "/api/nope",
  "/en/draft/x", "/en/draft/x?key=abc", "/hr/draft/x?key=abc",
  "/en/apple-oxidation-experiment?utm_source=test&utm_medium=x", "/EN/Apple-Oxidation-Experiment",
  "/en/apple-oxidation-experiment/", "/en/explore-number-pi-%CF%80", "/explore-number-pi-%CF%80",
  "/en/make-lava-lamp/amp", "/hr/kako-napraviti-lava-lampu/feed", "/en/make-lava-lamp/amp/",
  "/wp-content/uploads/2019/03/Explore-the-Mysterious-Number-Pi-%CF%80-Pi-explored-300x200.jpg",
  "/wp-content/uploads/2017/08/Kako-napraviti-Origami-Kucicu-Pocetna-slika-150x150.jpg",
  "/wp-content/uploads/2020/01/unknown-file.jpg", "/wp-content/uploads/2020/01/unknown-file-300x200.png",
  "/wp-login.php", "/xmlrpc.php", "/en/feed", "/feed",
  "/en?x=1", "/hr/", "/en/tools/", "/search-en.json",
];

const firstPass = await pool(pagePaths.slice(0, args.limit ? Number(args.limit) : undefined), async (p) => ({ p, r: await get(B, p) }));
// Same-origin assets referenced by the pages (as served by B).
const assetPaths = new Set();
for (const { r } of firstPass) {
  if (r.status !== 200) continue;
  const html = r.body.toString("utf8");
  for (const m of html.matchAll(/(?:src|href|srcset|content)="([^"]+)"/g)) {
    for (const part of m[1].split(",")) {
      const url = part.trim().split(/\s+/)[0];
      if (!url) continue;
      const p = toPath(url.startsWith("http") ? (url.startsWith(SITE) ? url : "") : url);
      if (!p.startsWith("/") || p.startsWith("//") || p.startsWith("/_next/")) continue;
      if (/\.(jpe?g|png|webp|avif|gif|svg|pdf|ico|xml|txt|webmanifest)(\?|$)/i.test(p) || /opengraph-image|icon-/.test(p)) {
        assetPaths.add(p);
      }
    }
  }
}

const paths = [
  ...new Set([
    ...special,
    ...pagePaths,
    ...pagePaths.filter((p) => p !== "/").map((p) => `${p}/`),
    ...redirectSources,
    ...assetPaths,
  ]),
];
process.stderr.write(
  `Checking ${paths.length} URLs (${pagePaths.length} pages, ${redirectSources.length} redirects, ${assetPaths.size} assets)\n` +
    `  A = ${A}\n  B = ${B}\n`,
);

const results = await pool(paths, async (p) => {
  const [ra, rb] = await Promise.all([get(A, p), get(B, p)]);
  const sa = summarize(ra);
  const sb = summarize(rb);
  let diffs = diff(sa, sb);
  let note;
  // Both redirect but to different places: fine if the chains end on the
  // same page with the same status (B may simply take fewer hops).
  if (diffs.length && sa.location && sb.location && diffs.every((d) => d.field === "location")) {
    const [fa, fb] = await Promise.all([finalHop(A, p), finalHop(B, p)]);
    if (fa.path === fb.path && fa.status === fb.status) {
      note = `same destination ${fa.path} (${fa.hops} hops on A, ${fb.hops} on B)`;
      diffs = [];
    }
  }
  const accepted = ACCEPTED.find((a) => a.path.test(p));
  if (diffs.length && accepted) {
    note = `accepted: ${accepted.reason}`;
    diffs = [];
  }
  return { path: p, a: sa, b: sb, diffs, note };
});

const failures = results.filter((r) => r.diffs.length > 0);
const notes = results.filter((r) => r.note);
const byField = {};
for (const f of failures) for (const d of f.diffs) byField[d.field] = (byField[d.field] ?? 0) + 1;

console.log(`\n${results.length - failures.length}/${results.length} URLs identical`);
if (notes.length) {
  console.log(`${notes.length} with an explained difference:`);
  for (const n of notes) console.log(`  ${n.path}: ${n.note}`);
}
if (failures.length) {
  console.log("Differences by field:", byField);
  for (const f of failures.slice(0, Number(args.show ?? 40))) {
    console.log(`\n${f.path}`);
    for (const d of f.diffs) {
      const show = (v) => (typeof v === "string" ? v : JSON.stringify(v))?.slice(0, 160);
      console.log(`  ${d.field}\n    A: ${show(d.a)}\n    B: ${show(d.b)}`);
    }
  }
}
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ A, B, checked: results.length, failures }, null, 2));
process.exitCode = failures.length ? 1 : 0;
