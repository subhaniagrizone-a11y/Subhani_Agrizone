const TAGS_REGEX = /<[^>]*>/g;
const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

export function sanitizeText(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .replace(SCRIPT_REGEX, "")
    .replace(TAGS_REGEX, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeEmail(value: unknown) {
  return sanitizeText(value).toLowerCase();
}

export function sanitizePhone(value: unknown) {
  return sanitizeText(value).replace(/[^+\d]/g, "");
}
