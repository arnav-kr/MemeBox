import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: "bot@memebox.arnv.dev" },
    update: {},
    create: {
      email: "bot@memebox.arnv.dev",
      name: "Meme Bot",
      role: Role.ADMIN,
      image: "https://api.dicebear.com/9.x/thumbs/svg?seed=Vivian",
    },
  });

  await prisma.$disconnect();
}

void main();
