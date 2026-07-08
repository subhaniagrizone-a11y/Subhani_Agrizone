import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function buildDatasourceUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return raw;

  try {
    const parsed = new URL(raw);

    if (process.env.MONGODB_TLS_INSECURE === "true") {
      parsed.searchParams.set("tls", "true");
      parsed.searchParams.set("tlsAllowInvalidCertificates", "true");
    }

    if (process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) {
      parsed.searchParams.set(
        "serverSelectionTimeoutMS",
        process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
      );
    }

    return parsed.toString();
  } catch {
    return raw;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
