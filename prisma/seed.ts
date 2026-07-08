import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    ["Seeds", "seeds"],
    ["Fertilizers", "fertilizers"],
    ["Pesticides", "pesticides"],
    ["Herbicides", "herbicides"],
    ["Fungicides", "fungicides"],
    ["Micronutrients", "micronutrients"],
    ["Growth Promoters", "growth-promoters"],
    ["Agriculture Equipment", "agriculture-equipment"],
    ["Sprayers", "sprayers"],
    ["Garden Products", "garden-products"],
    ["Organic Products", "organic-products"],
    ["Animal Feed", "animal-feed"],
  ];

  for (const [name, slug] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug, featured: true },
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: "contact" },
    update: {
      value: {
        phone: "+92 300 1234567",
        whatsapp: "+92 300 1234567",
        email: "support@subhniagrizone.com",
        address: "Pakistan",
      },
    },
    create: {
      key: "contact",
      group: "contact",
      value: {
        phone: "+92 300 1234567",
        whatsapp: "+92 300 1234567",
        email: "support@subhniagrizone.com",
        address: "Pakistan",
      },
    },
  });

  const adminEmail = "admin@subhniagrizone.com";
  const adminPassword = "Admin@12345";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      passwordHash: await hash(adminPassword, 10),
      name: "Admin User",
    },
    create: {
      email: adminEmail,
      name: "Admin User",
      role: "ADMIN",
      passwordHash: await hash(adminPassword, 10),
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
