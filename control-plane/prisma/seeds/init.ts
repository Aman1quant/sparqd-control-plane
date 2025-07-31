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

async function seedInitialServices() {
  const services = [
    {
      name: 'jupyterhub',
      displayName: 'JupyterHub',
      description: 'A multi-user version of the notebook designed for companies, classrooms and research labs',
      isFreeTier: true,
      versions: [
        {
          version: "4.2.0",
          isActive: true,
          isDefault: true,
          releaseDate: "2025-04-16T00:00:00Z"
        },
        {
          version: "4.1.0",
          isActive: true,
          isDefault: false,
          releaseDate: "2025-01-15T00:00:00Z"
        },
        {
          version: "4.0.0",
          isActive: true,
          isDefault: false,
          releaseDate: "2024-11-07T00:00:00Z"
        },
        {
          version: "3.3.0",
          isActive: false,
          isDefault: false,
          releaseDate: "2024-07-31T00:00:00Z"
        },
      ]
    },
    {
      name: 'spark',
      displayName: 'Spark',
      description: 'Unified engine for large-scale data analytics',
      isFreeTier: true,
      versions: [
        {
          version: "1.2.0",
          isActive: true,
          isDefault: true,
          releaseDate: "2025-07-03T00:00:00Z"
        }
      ]
    },
  ];
  for (const r of services) {
    const service = await prisma.service.upsert({
      where: { name: r.name },
      update: { description: r.description, displayName: r.displayName, isFreeTier: true },
      create: { name: r.name, description: r.description, displayName: r.displayName, isFreeTier: true },
    });

    // Upsert versions
    for (const v of r.versions) {
      await prisma.serviceVersion.upsert({
        where: {
          // composite unique key or fallback to unique (name+version) if not using composite ID
          uid: `${service.uid}-${v.version}` // optional — for uniqueness
        },
        update: {
          isDefault: v.isDefault,
          releaseDate: v.releaseDate
        },
        create: {
          serviceId: service.id,
          version: v.version,
          isDefault: v.isDefault,
          releaseDate: v.releaseDate
        }
      });
    }
  }
}



async function main() {
  await seedInitialRoles();
  await seedInitialServices();
}

main().then(() => prisma.$disconnect());
