require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.user.count();
    console.log("OK", count);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("ERR", message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
