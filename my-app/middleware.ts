import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that do NOT require authentication
const PUBLIC_PATHS = ["/", "/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Normalize path (remove trailing slash except root)
  const path = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  // Allow internal Next.js stuff and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.includes(path) || PUBLIC_PATHS.some(p => path.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Check token cookie
  const token = req.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname); // optional redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  // Token exists → allow
  return NextResponse.next();
}

// Apply middleware to all pages (excluding _next/static and _next/image)
export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
