import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const supportedLocales = ["/en", "/hr"];

  // If user is already in a language path → pass through, but stamp the pathname
  // so the root layout can read it and set <html lang> correctly.
  if (supportedLocales.some((loc) => pathname.startsWith(loc))) {
    const res = NextResponse.next();
    res.headers.set("x-pathname", pathname);
    return res;
  }

  // Redirect only the homepage "/"
  if (pathname === "/") {
    const acceptLanguage = req.headers.get("accept-language")?.toLowerCase() || "";
    const isCroatian = acceptLanguage.startsWith("hr");
    const locale = isCroatian ? "hr" : "en";

    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);
  return res;
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};