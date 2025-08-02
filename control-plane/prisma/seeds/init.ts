import { PrismaClient, Provider } from '@prisma/client';
const prisma = new PrismaClient();

async function seedInitialRoles() {
  const roles = [
    {
      name: 'NoRole',
      description: 'A user without any assigned role. No access to any resource or capability.',
    },
    {
      name: 'PlatformOwner',
      description: 'Has full administrative control over the entire platform. Can manage all accounts, users, global settings, and billing at the platform level.',
    },
    {
      name: 'PlatformAdmin',
      description: 'Can manage most platform-level settings, user provisioning, and accounts, but cannot delete the platform or transfer ownership.',
    },
    {
      name: 'PlatformMember',
      description: 'Has view-only access to platform-level dashboards and account listings but cannot perform any administrative tasks.',
    },
    {
      name: 'AccountOwner',
      description: 'Owns a specific customer account. Can manage workspaces, users, billing, and integrations within the account.',
    },
    {
      name: 'AccountAdmin',
      description: 'Manages users, workspaces, and configuration inside an account. Cannot delete the account or transfer ownership.',
    },
    {
      name: 'AccountMember',
      description: 'Has access to workspaces in the account, depending on workspace-level roles. Cannot manage account settings or users.',
    },
    {
      name: 'WorkspaceOwner',
      description: 'Full control over a workspace. Can manage settings, add/remove users, and administer resources such as clusters and jobs.',
    },
    {
      name: 'WorkspaceAdmin',
      description: 'Can manage most workspace resources including clusters, notebooks, users, and permissions, but cannot delete the workspace or transfer ownership.',
    },
    {
      name: 'WorkspaceMember',
      description: 'A regular user in a workspace. Can create and run notebooks, access shared data, and use compute, based on cluster access.',
    },
    {
      name: 'ClusterOwner',
      description: 'Has full control over a specific cluster. Can configure, start, stop, and delete the cluster.',
    },
    {
      name: 'ClusterAdmin',
      description: 'Can manage the lifecycle of a cluster (start/stop/restart) and modify its configuration but cannot delete it.',
    },
    {
      name: 'ClusterMember',
      description: 'Can attach to a running cluster and run jobs or notebooks on it, but cannot configure or manage the cluster itself.',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: {
        name: role.name,
        description: role.description,
      },
    });
  }
}

async function seedInitialClusterTshirtSize() {
  const tshirtSize = [
    {
      provider: Provider.AWS,
      name: 'aws.micro',
      description: 'n/a',
      nodeInstanceTypes: [
        't3.micro'
      ],
      isActive: true,
      isFreeTier: true
    }
  ]
  for (const ts of tshirtSize) {
    await prisma.clusterTshirtSize.upsert({
      where: { name: ts.name },
      update: { description: ts.description },
      create: {
        provider: ts.provider,
        name: ts.name,
        description: ts.description,
        nodeInstanceTypes: ts.nodeInstanceTypes,
        isActive: ts.isActive,
        isFreeTier: ts.isFreeTier
      },
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
  await seedInitialClusterTshirtSize();
  await seedInitialServices();
}

main().then(() => prisma.$disconnect());
