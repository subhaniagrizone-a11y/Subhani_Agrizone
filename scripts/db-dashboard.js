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
    console.log("\n" + "=".repeat(60));
    console.log("🗄️  SUBHANI AGRIZONE - DATABASE DASHBOARD");
    console.log("=".repeat(60) + "\n");

    // Get all counts
    const users = await prisma.user.count();
    const products = await prisma.product.count();
    const orders = await prisma.order.count();
    const blogs = await prisma.blogPost.count();
    const categories = await prisma.category.count();
    const addresses = await prisma.address.count();
    const reviews = await prisma.review.count();

    console.log("📊 DATA SUMMARY\n");
    console.log("Users           │ " + String(users).padEnd(4) + "│");
    console.log("Products        │ " + String(products).padEnd(4) + "│");
    console.log("Orders          │ " + String(orders).padEnd(4) + "│");
    console.log("Blog Posts      │ " + String(blogs).padEnd(4) + "│");
    console.log("Categories      │ " + String(categories).padEnd(4) + "│");
    console.log("Addresses       │ " + String(addresses).padEnd(4) + "│");
    console.log("Reviews         │ " + String(reviews).padEnd(4) + "│");

    const totalRecords =
      users + products + orders + blogs + categories + addresses + reviews;
    console.log("─".repeat(30));
    console.log("TOTAL           │ " + String(totalRecords).padEnd(4) + "│\n");

    // Connection info
    const dbUrl = process.env.DATABASE_URL;
    const dbName = dbUrl.split("/").pop()?.split("?")[0] || "unknown";
    const host = dbUrl.includes("mongodb+srv") ? "MongoDB Atlas" : "Local";

    console.log("🔗 CONNECTION INFO\n");
    console.log("Host            │ " + host);
    console.log("Database        │ " + dbName);
    console.log("Status          │ ✅ Connected\n");

    // Recommendations
    console.log("💡 QUICK COMMANDS\n");
    console.log("npm run db:test      - Test connection");
    console.log("npm run db:clear     - Clear all data");
    console.log("npm run db:studio    - Open database studio");
    console.log("npm run db:push      - Sync schema");
    console.log("npm run db:reset     - Full database reset\n");

    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
