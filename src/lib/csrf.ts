import { randomBytes, timingSafeEqual } from "crypto";

const CSRF_COOKIE_NAME = "checkout_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function createCsrfToken() {
  return randomBytes(24).toString("hex");
}

export function getCsrfCookieName() {
  return CSRF_COOKIE_NAME;
}

export function getCsrfHeaderName() {
  return CSRF_HEADER_NAME;
}

export function verifyCsrf(request: Request, cookieToken: string | null) {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (!cookieToken || !headerToken) return false;
  return safeEqual(headerToken, cookieToken);
}
