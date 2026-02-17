import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

// Paths that require authentication
const protectedPaths = ["/dashboard", "/create"];

// Paths that should redirect to dashboard if authenticated
const authPaths = ["/login", "/signup"];

async function isValidToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;
  
  // Check if token is actually valid
  const hasValidToken = token ? await isValidToken(token) : false;

  // If token exists but is invalid, clear it immediately
  if (token && !hasValidToken) {
    const response = NextResponse.next();
    response.cookies.delete("auth-token");
    return response;
  }

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if it's an auth path (login/signup)
  const isAuthPath = authPaths.some((path) => pathname === path);

  // Redirect to login if accessing protected path without valid token
  if (isProtectedPath && !hasValidToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if accessing auth pages while logged in with valid token
  if (isAuthPath && hasValidToken) {
    // Unless they have the continue param (from onboarding flow)
    const continueParam = request.nextUrl.searchParams.get("continue");
    if (!continueParam) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     * - sites routes (public generated sites)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api|sites).*)",
  ],
};
