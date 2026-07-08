import { NextResponse } from "next/server";

import {
  createCsrfToken,
  getCsrfCookieName,
  getCsrfHeaderName,
} from "@/lib/csrf";

export async function GET() {
  const token = createCsrfToken();
  const response = NextResponse.json({
    ok: true,
    csrfToken: token,
    header: getCsrfHeaderName(),
  });

  response.cookies.set({
    name: getCsrfCookieName(),
    value: token,
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}
