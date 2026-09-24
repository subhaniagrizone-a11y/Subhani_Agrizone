const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

// Load DATABASE_URL from .env.local
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
  const prisma = new PrismaClient();

  try {
    console.log("\n✅ MONGODB CONNECTION TEST\n");
    console.log(
      "Database URL:",
      process.env.DATABASE_URL.substring(0, 80) + "...\n",
    );

    // Test connection
    const ping = await prisma.$runCommandRaw({ ping: 1 });
    console.log("✓ Connection Successful");

    // Count all data
    const users = await prisma.user.count();
    const products = await prisma.product.count();
    const orders = await prisma.order.count();
    const blogs = await prisma.blogPost.count();
    const categories = await prisma.category.count();

    console.log("\n📊 Current Data Summary:");
    console.log(`├─ Users:       ${users}`);
    console.log(`├─ Products:    ${products}`);
    console.log(`├─ Orders:      ${orders}`);
    console.log(`├─ Blog Posts:  ${blogs}`);
    console.log(`└─ Categories: ${categories}`);

    console.log("\n✅ Database is connected and ready!\n");
  } catch (error) {
    console.error("\n❌ Connection Error:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
