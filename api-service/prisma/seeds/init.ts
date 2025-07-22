import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedInitialRoles() {
  const roles = [
    'NoRole',
    'AccountOwner',
    'AccountAdmin',
    'AccountMember',
    'WorkspaceOwner',
    'WorkspaceAdmin',
    'WorkspaceMember',
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
