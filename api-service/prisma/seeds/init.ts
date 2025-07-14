import { PrismaClient } from '../app/generated/prisma/client';
const prisma = new PrismaClient();

async function seedInitialRoles() {
  const roles = [
    'Admin',
    'AccountAdmin',
    'WorkspaceAdmin',
  ];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r },
      update: {},
      create: { name: r },
    });
  }
}

async function main() {
  await seedInitialRoles();
}

main().then(() => prisma.$disconnect());
