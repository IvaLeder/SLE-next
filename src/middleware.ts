import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const supportedLocales = ["/en", "/hr"];

  // If user is already in a language path → do nothing
  if (supportedLocales.some((loc) => pathname.startsWith(loc))) {
    return NextResponse.next();
  }

  // Redirect only the homepage "/"
  if (pathname === "/") {
    const acceptLanguage = req.headers.get("accept-language")?.toLowerCase() || "";
    const isCroatian = acceptLanguage.startsWith("hr");
    const locale = isCroatian ? "hr" : "en";

    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};