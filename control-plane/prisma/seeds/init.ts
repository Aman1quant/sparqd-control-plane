import { PrismaClient, Provider } from '@prisma/client';
const prisma = new PrismaClient();

async function seedInitialCloudProviders() {
  console.log("Seeding cloud providers...")
  const cloudProviders = [
    {
      "uid": "8ad0b3a3-3b3c-47ba-99ec-754dcf09a5b1",
      "name": "aws",
      "displayName": "AWS"
    },
    {
      "uid": "8b7c7a1a-c1c5-4721-95d9-237411b0d74c",
      "name": "gcp",
      "displayName": "GCP"
    },
    {
      "uid": "90f71e82-2d58-4dc0-ae92-fae82960c410",
      "name": "alicloud",
      "displayName": "Alibaba Cloud"
    },
  ];

  for (const cp of cloudProviders) {
    await prisma.cloudProvider.upsert({
      where: { uid: cp.uid },
      update: {
        name: cp.name as Provider,
        displayName: cp.displayName,
      },
      create: {
        uid: cp.uid,
        name: cp.name as Provider,
        displayName: cp.displayName,
      },
    });
  }
}

async function seedInitialCloudRegions() {
  console.log("Seeding cloud regions...")
  const cloudRegions = [
    {
      "uid": "709cb1d8-0320-485e-982a-a3f60c4def66",
      "name": "ap-southeast-1",
      "displayName": "AWS Singapore",
      "cloudProviderUid": "8ad0b3a3-3b3c-47ba-99ec-754dcf09a5b1",
    },
    {
      "uid": "54b238f6-4356-4cc3-876c-c83b01c6427a",
      "name": "asia-southeast1",
      "displayName": "GCP Singapore",
      "cloudProviderUid": "8b7c7a1a-c1c5-4721-95d9-237411b0d74c",
    },
    {
      "uid": "0ca427cf-b3bc-42e0-8296-ebd21161ef6b",
      "name": "ap-southeast-1",
      "displayName": "Alibaba Cloud Singapore",
      "cloudProviderUid": "90f71e82-2d58-4dc0-ae92-fae82960c410",
    },
  ];

  for (const cr of cloudRegions) {
    await prisma.region.upsert({
      where: { uid: cr.uid },
      update: {
        name: cr.name,
        displayName: cr.displayName,
        cloudProvider: { connect: {uid: cr.cloudProviderUid}},
      },
      create: {
        uid: cr.uid,
        name: cr.name,
        displayName: cr.displayName,
        cloudProvider: { connect: {uid: cr.cloudProviderUid}},
      },
    });
  }
}

async function seedInitialRoles() {
  console.log("Seeding roles...")
  const roles = [
    {
      "uid": "eff4b1cf-e869-4e9b-aa73-c5dd04b5d97f",
      "name": "NoRole",
      "description": "A user without any assigned role. No access to any resource or capability."
    },
    {
      "uid": "93d9c8c8-d86e-46db-a7ac-258d6e1f89fd",
      "name": "SystemRole",
      "description": "System role."
    },
    {
      "uid": "2029ed00-196d-46ae-83c4-b6815126c4f5",
      "name": "PlatformOwner",
      "description": "Has full administrative control over the entire platform. Can manage all accounts, users, global settings, and billing at the platform level."
    },
    {
      "uid": "b5752fdc-1910-485c-8416-e3e8af74da29",
      "name": "PlatformAdmin",
      "description": "Can manage most platform-level settings, user provisioning, and accounts, but cannot delete the platform or transfer ownership."
    },
    {
      "uid": "afdd1e97-d89a-4a1c-bba4-fb315791e776",
      "name": "PlatformMember",
      "description": "Has view-only access to platform-level dashboards and account listings but cannot perform any administrative tasks."
    },
    {
      "uid": "2e34b004-22ae-45c3-bace-6182ff971dbb",
      "name": "AccountOwner",
      "description": "Owns a specific customer account. Can manage workspaces, users, billing, and integrations within the account."
    },
    {
      "uid": "b4afa017-11a5-45dd-a446-55e66ab432ca",
      "name": "AccountAdmin",
      "description": "Manages users, workspaces, and configuration inside an account. Cannot delete the account or transfer ownership."
    },
    {
      "uid": "9950474c-df47-4705-b6c4-eb6c83b8f8c3",
      "name": "AccountMember",
      "description": "Has access to workspaces in the account, depending on workspace-level roles. Cannot manage account settings or users."
    },
    {
      "uid": "f5b09aa0-e513-4747-bd10-00254af6ca71",
      "name": "WorkspaceOwner",
      "description": "Full control over a workspace. Can manage settings, add\/remove users, and administer resources such as clusters and jobs."
    },
    {
      "uid": "7a54e29e-da4f-4ff5-ae0e-e6bc877f641d",
      "name": "WorkspaceAdmin",
      "description": "Can manage most workspace resources including clusters, notebooks, users, and permissions, but cannot delete the workspace or transfer ownership."
    },
    {
      "uid": "fcb0676a-8736-4a57-9bd9-63efaae18943",
      "name": "WorkspaceMember",
      "description": "A regular user in a workspace. Can create and run notebooks, access shared data, and use compute, based on cluster access."
    },
    {
      "uid": "85f176c8-8b2b-42e6-ab45-c5275cae892b",
      "name": "ClusterOwner",
      "description": "Has full control over a specific cluster. Can configure, start, stop, and delete the cluster."
    },
    {
      "uid": "f3e65ec5-8b51-47ff-8c4d-b37f0d682536",
      "name": "ClusterAdmin",
      "description": "Can manage the lifecycle of a cluster (start\/stop\/restart) and modify its configuration but cannot delete it."
    },
    {
      "uid": "8a0ef6e4-6904-4b8e-aaf7-a32ec2eb3a03",
      "name": "ClusterMember",
      "description": "Can attach to a running cluster and run jobs or notebooks on it, but cannot configure or manage the cluster itself."
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { uid: role.uid },
      update: {
        name: role.name,
        description: role.description,
      },
      create: {
        uid: role.uid,
        name: role.name,
        description: role.description,
      },
    });
  }
}

const SYSTEM_USER_EMAIL = "system@quant-data.io";
async function seedInitialUsers() {
  console.log("Seeding initial users...")
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
  console.log("Seeding initial cluster tshirt size...")
  const clusterSizesToSeed = [
    {
      cloudProvider: 'aws',
      region: 'ap-southeast-1',
      sizes: [
        {
          uid: "3584817a-74a4-4ea3-8180-6510824c5de2",
          name: 'micro',
          description: 'n/a',
          nodeInstanceTypes: ['t3.micro'],
          isFreeTier: true,
        },
        {
          uid: "d233b4a9-79ae-40d0-9a9b-5aa6d20e6134",
          name: 'small',
          description: 'n/a',
          nodeInstanceTypes: ['t3.small'],
          isFreeTier: false,
        },
      ],
    },
  ];

  for (const group of clusterSizesToSeed) {
    const cloudProvider = await prisma.cloudProvider.findUnique({
      where: { name: group.cloudProvider as Provider },
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
          uid: size.uid,
          description: size.description,
          nodeInstanceTypes: size.nodeInstanceTypes,
          isActive: true,
          isFreeTier: size.isFreeTier,
        },
        create: {
          uid: size.uid,
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
  console.log("Seeding initial services...")
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
  await seedInitialCloudRegions();
  await seedInitialRoles();
  await seedInitialUsers();
  const systemUser = await prisma.user.findUnique({ where: { email: SYSTEM_USER_EMAIL } })
  if (systemUser) {
    await seedInitialClusterTshirtSize(systemUser.id);
    await seedInitialServices();
  }
  console.log("Seed finished")
}

main().then(() => prisma.$disconnect());
