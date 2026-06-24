import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirects "/" to the user's preferred language landing page.
 * All other routes pass through unchanged — each language now has its own
 * static root layout, so we no longer need to stamp x-pathname for the layout
 * to read.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    const acceptLanguage = req.headers.get("accept-language")?.toLowerCase() ?? "";
    const locale = acceptLanguage.startsWith("hr") ? "hr" : "en";
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
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
