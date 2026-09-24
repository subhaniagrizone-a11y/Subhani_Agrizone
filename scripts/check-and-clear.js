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
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not found in .env.local");
  }

  const prisma = new PrismaClient();

  try {
    console.log("\n🔍 CHECKING CURRENT DATA...\n");

    const productCount = await prisma.product.count();
    const blogCount = await prisma.blogPost.count();

    console.log(`📦 Products: ${productCount}`);
    console.log(`📝 Blog Posts: ${blogCount}`);

    if (productCount === 0 && blogCount === 0) {
      console.log("\n✅ Database is already empty!\n");
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log("\n🗑️  CLEARING DATA...\n");

    // Delete all products (this will cascade delete related data)
    if (productCount > 0) {
      await prisma.product.deleteMany({});
      console.log(`✓ Deleted ${productCount} products`);
    }

    // Delete all blog posts
    if (blogCount > 0) {
      await prisma.blogPost.deleteMany({});
      console.log(`✓ Deleted ${blogCount} blog posts`);
    }

    // Verify data is cleared
    const newProductCount = await prisma.product.count();
    const newBlogCount = await prisma.blogPost.count();

    console.log("\n✅ DATA CLEARED SUCCESSFULLY!\n");
    console.log(`Final Products: ${newProductCount}`);
    console.log(`Final Blog Posts: ${newBlogCount}\n`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
