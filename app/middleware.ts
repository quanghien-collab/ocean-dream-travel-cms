import { NextRequest, NextResponse } from "next/server";

const locales = ["vi", "en"];
const defaultLocale = "vi";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return;
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (!hasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }
}
