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

  console.log("\n🔗 MongoDB Connection String:");
  const dbUrl = process.env.DATABASE_URL;
  console.log(dbUrl.replace(/:\w+@/, ":****@") + "\n");

  const prisma = new PrismaClient();

  try {
    console.log("🔍 CHECKING CURRENT DATA IN MONGODB...\n");

    const productCount = await prisma.product.count();
    const blogCount = await prisma.blogPost.count();
    const orderCount = await prisma.order.count();

    console.log(`📦 Products:   ${productCount}`);
    console.log(`📝 Blog Posts: ${blogCount}`);
    console.log(`📋 Orders:    ${orderCount}`);

    const totalRecords = productCount + blogCount + orderCount;

    if (totalRecords === 0) {
      console.log("\n✅ Database is already empty!\n");
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log(`\n🗑️  DELETING ${totalRecords} RECORDS...\n`);

    // Delete related data in proper order to avoid constraint violations

    // 1. Delete order items (they reference orders and products)
    const orderItemsDeleted = await prisma.orderItem.deleteMany({});
    console.log(`✓ Deleted ${orderItemsDeleted.count} order items`);

    // 2. Delete orders
    if (orderCount > 0) {
      const deleted = await prisma.order.deleteMany({});
      console.log(`✓ Deleted ${deleted.count} orders`);
    }

    // 3. Delete product-related data
    const reviewsDeleted = await prisma.review.deleteMany({});
    if (reviewsDeleted.count > 0)
      console.log(`✓ Deleted ${reviewsDeleted.count} reviews`);

    const wishlistDeleted = await prisma.wishlistItem.deleteMany({});
    if (wishlistDeleted.count > 0)
      console.log(`✓ Deleted ${wishlistDeleted.count} wishlist items`);

    const compareDeleted = await prisma.compareItem.deleteMany({});
    if (compareDeleted.count > 0)
      console.log(`✓ Deleted ${compareDeleted.count} compare items`);

    const recentlyViewedDeleted = await prisma.recentlyViewed.deleteMany({});
    if (recentlyViewedDeleted.count > 0)
      console.log(`✓ Deleted ${recentlyViewedDeleted.count} recently viewed`);

    const productRelationDeleted = await prisma.productRelation.deleteMany({});
    if (productRelationDeleted.count > 0)
      console.log(
        `✓ Deleted ${productRelationDeleted.count} product relations`,
      );

    const variantsDeleted = await prisma.productVariant.deleteMany({});
    if (variantsDeleted.count > 0)
      console.log(`✓ Deleted ${variantsDeleted.count} product variants`);

    const imagesDeleted = await prisma.productImage.deleteMany({});
    if (imagesDeleted.count > 0)
      console.log(`✓ Deleted ${imagesDeleted.count} product images`);

    const inventoryDeleted = await prisma.inventoryLog.deleteMany({});
    if (inventoryDeleted.count > 0)
      console.log(`✓ Deleted ${inventoryDeleted.count} inventory logs`);

    // 4. Delete all products
    if (productCount > 0) {
      const deleted = await prisma.product.deleteMany({});
      console.log(`✓ Deleted ${deleted.count} products`);
    }

    // 5. Delete all blog posts
    if (blogCount > 0) {
      const deleted = await prisma.blogPost.deleteMany({});
      console.log(`✓ Deleted ${deleted.count} blog posts`);
    }

    // Verify data is cleared
    console.log("\n📊 VERIFYING...\n");
    const newProductCount = await prisma.product.count();
    const newBlogCount = await prisma.blogPost.count();
    const newOrderCount = await prisma.order.count();

    console.log(`Final Products:   ${newProductCount}`);
    console.log(`Final Blog Posts: ${newBlogCount}`);
    console.log(`Final Orders:    ${newOrderCount}`);

    console.log("\n✅ ALL DATA CLEARED SUCCESSFULLY!\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
