import { auth0 } from "./lib/auth0";
import { NextRequest, NextResponse } from "next/server";

function isPublicPath(pathname: string) {
  return pathname === "/" || pathname.startsWith("/auth");
}

function isSessionCookieError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === "ERR_JWE_INVALID" ||
    maybeError.message === "Invalid Compact JWE"
  );
}

function clearAuthCookies(request: NextRequest, response: NextResponse) {
  const knownAuthCookies = ["appSession", "__session"];

  for (const cookie of request.cookies.getAll()) {
    const shouldClear =
      knownAuthCookies.includes(cookie.name) ||
      cookie.name.startsWith("auth0") ||
      cookie.name.startsWith("a0:");

    if (shouldClear) {
      response.cookies.delete(cookie.name);
    }
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let authResponse: NextResponse;
  try {
    authResponse = await auth0.middleware(request);
  } catch (error) {
    if (!isSessionCookieError(error)) {
      throw error;
    }

    if (pathname.startsWith("/api/")) {
      const unauthorized = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      clearAuthCookies(request, unauthorized);
      return unauthorized;
    }

    const fallbackPath = isPublicPath(pathname) ? pathname : "/auth/login";
    const recoveryResponse = NextResponse.redirect(new URL(fallbackPath, request.url));
    clearAuthCookies(request, recoveryResponse);
    return recoveryResponse;
  }

  if (isPublicPath(pathname)) {
    return authResponse;
  }

  const session = await auth0.getSession(request);
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
