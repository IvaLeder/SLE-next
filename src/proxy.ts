import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirects "/" to the user's preferred language landing page.
 * All other routes pass through unchanged — each language now has its own
 * static root layout, so we no longer need to stamp x-pathname for the layout
 * to read.
 */
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

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    // Device language decides, because that is what actually says whether a
    // reader *can* read English. Croatian wins only when it outranks English
    // in the browser's own ordered list, so "en-GB,hr" still gets English.
    // Vercel's edge geo header is a tiebreaker for the rare visitor whose
    // languages mention neither (e.g. a German-only phone in Croatia).
    const tags = preferredTags(req.headers.get("accept-language") ?? "");
    const hr = tags.findIndex((t) => t.startsWith("hr"));
    const en = tags.findIndex((t) => t.startsWith("en"));
    const wantsCroatian =
      hr !== -1
        ? en === -1 || hr < en
        : en === -1 && req.headers.get("x-vercel-ip-country") === "HR";
    return NextResponse.redirect(new URL(wantsCroatian ? "/hr" : "/en", req.url));
  }

  // Non-ASCII URL guard. Some old WordPress permalinks contained non-ASCII
  // characters (e.g. the Pi article was /en/explore-number-pi-π). When such a
  // URL is requested, Next tries to put the raw character into the
  // `x-next-cache-tags` HTTP header and throws "Invalid character in header
  // content" → a 500 (seen on Vercel for /en/explore-number-pi-%CF%80). No
  // valid route on this site uses non-ASCII characters, so strip them and 301
  // to the cleaned path — this recovers the real article for the Pi case and
  // cleanly 404s anything else, instead of crashing.
  // `pathname` arrives percent-encoded (π → %CF%80), so decode before checking.
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // Malformed escape sequence — leave as-is and let it 404 normally.
  }
  const hasNonAscii = [...decoded].some((c) => c.charCodeAt(0) > 127);
  if (hasNonAscii) {
    const cleaned = [...decoded]
      .filter((c) => c.charCodeAt(0) <= 127)
      .join("")
      .replace(/-{2,}/g, "-") // collapse the double dashes stripping may leave
      .replace(/-(\/|$)/g, "$1"); // trim a trailing dash per path segment
    if (cleaned && cleaned !== "/" && cleaned !== decoded) {
      const url = req.nextUrl.clone();
      url.pathname = cleaned;
      return NextResponse.redirect(url, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
