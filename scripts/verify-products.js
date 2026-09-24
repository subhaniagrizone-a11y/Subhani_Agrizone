const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const counts = await prisma.product.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  console.log("COUNTS");
  console.log(JSON.stringify(counts, null, 2));

  const sample = await prisma.product.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      slug: true,
      sku: true,
      createdAt: true,
    },
  });

  console.log("SAMPLE");
  console.log(JSON.stringify(sample, null, 2));

  await prisma.$disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
