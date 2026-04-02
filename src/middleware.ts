import { NextResponse, type NextRequest } from "next/server";

const TOKEN_COOKIE = "accesshub_token";

function isLoggedIn(req: NextRequest) {
  return Boolean(req.cookies.get(TOKEN_COOKIE)?.value);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const loggedIn = isLoggedIn(req);

  // If already logged in, block login/register pages.
  if (pathname === "/login" || pathname.startsWith("/register/")) {
    if (loggedIn) return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }

  // Protect dashboards.
  if (pathname.startsWith("/dashboard")) {
    if (!loggedIn) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register/:path*"],
};
