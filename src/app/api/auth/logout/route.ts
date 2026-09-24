import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  for (const name of [
    "sa_session",
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      maxAge: 0,
    });
  }

  return response;
}
