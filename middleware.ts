import { NextResponse, type NextRequest } from "next/server";

import { rateLimit } from "@/lib/rate-limit";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=()",
  );

  if (request.nextUrl.pathname.startsWith("/api/")) {
    const key =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "local";
    const limited = rateLimit(
      `${key}:${request.nextUrl.pathname}`,
      120,
      60_000,
    );

    if (!limited.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: response.headers,
        },
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr|_next/data|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
