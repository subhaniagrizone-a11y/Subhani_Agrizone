const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "subhaniagrizone@gmail.com";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD must be set before creating an admin.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: "ADMIN",
        passwordHash: await bcrypt.hash(password, 10),
        emailVerified: new Date(),
      },
    });
    console.log("updated", existing.id);
  } else {
    const created = await prisma.user.create({
      data: {
        email,
        name: "Admin User",
        role: "ADMIN",
        passwordHash: await bcrypt.hash(password, 10),
        emailVerified: new Date(),
      },
    });
    console.log("created", created.id);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
