import { PrismaClient, Provider } from '@prisma/client';
const prisma = new PrismaClient();

async function seedInitialCloudProviders() {
  const regionsToSeed = [
    {
      provider: 'AWS',
      providerDisplayName: 'AWS',
      region: 'ap-southeast-1',
      displayName: 'AWS Singapore',
    },
    {
      provider: 'GCP',
      providerDisplayName: 'GCP',
      region: 'asia-southeast1',
      displayName: 'GCP Singapore',
    },
    {
      provider: 'ALICLOUD',
      providerDisplayName: 'Alibaba Cloud',
      region: 'ap-southeast-1',
      displayName: 'Alibaba Cloud Singapore',
    },
  ];

  for (const entry of regionsToSeed) {
    const cloudProvider = await prisma.cloudProvider.upsert({
      where: { name: entry.provider },
      update: {},
      create: {
        name: entry.provider,
        displayName: entry.providerDisplayName,
      },
    });

    await prisma.region.upsert({
      where: {
        // composite unique constraint
        name_cloudProviderId: {
          name: entry.region,
          cloudProviderId: cloudProvider.id,
        },
      },
      update: {
        displayName: entry.displayName,
      },
      create: {
        name: entry.region,
        displayName: entry.displayName,
        cloudProviderId: cloudProvider.id,
      },
    });
  }
}

async function seedInitialRoles() {
  const roles = [
    {
      name: 'NoRole',
      description: 'A user without any assigned role. No access to any resource or capability.',
    },
    {
      name: 'SystemRole',
      description: 'System role.',
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

const SYSTEM_USER_EMAIL = "system@quant-data.io";
async function seedInitialUsers() {
  const users = [
    {
      email: SYSTEM_USER_EMAIL,
    }
  ]
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        kcSub: "00000000-0000-0000-0000-000000000000",
      },
    });
  }
}

async function seedInitialClusterTshirtSize(systemUserId: bigint) {
  const clusterSizesToSeed = [
    {
      cloudProvider: 'AWS',
      region: 'ap-southeast-1',
      sizes: [
        {
          name: 'micro',
          description: 'n/a',
          nodeInstanceTypes: ['t3.micro'],
          isFreeTier: true,
        },
        {
          name: 'small',
          description: 'n/a',
          nodeInstanceTypes: ['t3.small'],
          isFreeTier: false,
        },
      ],
    },
    // {
    //   cloudProvider: 'ALICLOUD',
    //   region: 'ap-southeast-1',
    //   sizes: [
    //     {
    //       name: 'micro',
    //       description: 'Ali micro',
    //       nodeInstanceTypes: ['ecs.t5-lc1m1.small'],
    //       isFreeTier: true,
    //     },
    //   ],
    // },
  ];

  for (const group of clusterSizesToSeed) {
    const cloudProvider = await prisma.cloudProvider.findUnique({
      where: { name: group.cloudProvider },
    });

    if (!cloudProvider) {
      console.warn(`⚠️ Cloud provider ${group.cloudProvider} not found, skipping...`);
      continue;
    }

    const region = await prisma.region.findUnique({
      where: {
        name_cloudProviderId: {
          name: group.region,
          cloudProviderId: cloudProvider.id,
        },
      },
    });

    if (!region) {
      console.warn(`⚠️ Region ${group.region} (${group.cloudProvider}) not found, skipping...`);
      continue;
    }

    for (const size of group.sizes) {
      await prisma.clusterTshirtSize.upsert({
        where: {
          regionId_name: {
            regionId: region.id,
            name: size.name,
          },
        },
        update: {
          description: size.description,
          nodeInstanceTypes: size.nodeInstanceTypes,
          isActive: true,
          isFreeTier: size.isFreeTier,
        },
        create: {
          regionId: region.id,
          name: size.name,
          description: size.description,
          nodeInstanceTypes: size.nodeInstanceTypes,
          isActive: true,
          isFreeTier: size.isFreeTier,
          createdById: systemUserId,
        },
      });
    }
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
          app_version: "5.3.0",
          isActive: true,
          isDefault: true,
          releaseDate: "2025-04-16T00:00:00Z"
        },
        {
          version: "4.1.0",
          app_version: "5.2.1",
          isActive: true,
          isDefault: false,
          releaseDate: "2025-01-15T00:00:00Z"
        },
        {
          version: "4.0.0",
          app_version: "5.2.1",
          isActive: true,
          isDefault: false,
          releaseDate: "2024-11-07T00:00:00Z"
        },
        {
          version: "3.3.8",
          app_version: "4.1.6",
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
          app_version: "0.4.0",
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
  await seedInitialCloudProviders();
  await seedInitialRoles();
  await seedInitialUsers();
  const systemUser = await prisma.user.findUnique({ where: { email: SYSTEM_USER_EMAIL } })
  if (systemUser) {
    await seedInitialClusterTshirtSize(systemUser.id);
    await seedInitialServices();
  }
}

main().then(() => prisma.$disconnect());
