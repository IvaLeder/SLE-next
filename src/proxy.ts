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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
