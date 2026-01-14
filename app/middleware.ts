import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Nếu đã có /vi hoặc /en thì không redirect
  if (pathname.startsWith("/vi") || pathname.startsWith("/en") || pathname.startsWith("/admin")) {
    return;
  }

  const lang = request.headers.get("accept-language") || "";
  const isEN = lang.toLowerCase().includes("en");

  const url = request.nextUrl.clone();
  url.pathname = isEN ? "/en" : "/vi";

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/"],
};
