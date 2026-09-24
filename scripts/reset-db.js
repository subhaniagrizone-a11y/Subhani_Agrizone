const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { execSync } = require("child_process");

const envPath = path.join(__dirname, "..", ".env.local");
const envFile = fs.readFileSync(envPath, "utf8");

for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

  const [key, ...rest] = trimmed.split("=");
  const value = rest.join("=").trim();
  if (key === "DATABASE_URL") {
    process.env.DATABASE_URL = value.replace(/^"|"$/g, "");
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not found in .env.local");
  }

  const prisma = new PrismaClient();

  try {
    console.log("Dropping MongoDB database...");
    await prisma.$runCommandRaw({ dropDatabase: 1 });
    console.log("Database dropped successfully.");
  } catch (error) {
    console.error("Database drop failed:", error);
    process.exitCode = 1;
    await prisma.$disconnect();
    return;
  }

  await prisma.$disconnect();

  try {
    console.log("Syncing Prisma schema...");
    execSync("npx prisma db push --accept-data-loss", {
      stdio: "inherit",
      shell: true,
      cwd: path.join(__dirname, ".."),
    });

    console.log("Seeding fresh data...");
    execSync("npm run seed", {
      stdio: "inherit",
      shell: true,
      cwd: path.join(__dirname, ".."),
    });

    const freshPrisma = new PrismaClient();
    const [productCount, categoryCount, userCount] = await Promise.all([
      freshPrisma.product.count(),
      freshPrisma.category.count(),
      freshPrisma.user.count(),
    ]);

    console.log("Fresh database summary:", {
      productCount,
      categoryCount,
      userCount,
    });

    await freshPrisma.$disconnect();
  } catch (error) {
    console.error("Reseed failed:", error);
    process.exitCode = 1;
  }
}

main();
