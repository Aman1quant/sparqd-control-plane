import { PrismaClient } from '@prisma/app/generated/prisma/client';
import { initKeycloakAdminClient } from '@/config/clients/keycloak-admin.client';
import config from '@/config/config';
import logger from '@/config/logger';
import { validateRequiredFields } from '@/utils/api';

const prisma = new PrismaClient();

interface SignupInput {
  accountName: string;
  email: string;
  password: string;
  fullName?: string;
}

export async function signup({ accountName, email, password, fullName }: SignupInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  logger.debug('Check signup eligibility');
  if (existingUser) {
    throw {
      status: 409,
      message: 'User already signed up. Please login instead.',
    };
  }

  logger.debug('Create Account in DB');
  const account = await prisma.account.create({
    data: {
      name: accountName,
    },
    // select: {

    // }
  });

  const kcAdmin = await initKeycloakAdminClient();

  logger.debug('Create Realm');
  await kcAdmin.realms.create({
    realm: account.uid,
    enabled: true,
  });

  logger.debug('Create Client in Realm');
  await kcAdmin.clients.create({
    realm: account.uid,
    clientId: config.controlPlaneClient,
    publicClient: true,
    redirectUris: [config.controlPlaneRedirectURI],
    standardFlowEnabled: true,
  });

  logger.debug('Create Keycloak User');
  await kcAdmin.users.create({
    realm: account.uid,
    username: email,
    email,
    enabled: true,
    emailVerified: true,
    credentials: [
      {
        type: 'password',
        value: password,
        temporary: false,
      },
    ],
  });

  logger.debug('Get created user to get the ID');
  const users = await kcAdmin.users.find({ realm: account.uid, email });
  const kcUser = users[0];

  if (!kcUser || !kcUser.id) {
    throw new Error('Keycloak user not found or missing ID');
  } else {
    const kcSub = kcUser.id;
    const role = await prisma.role.findUnique({ where: { name: 'AccountAdmin' } });

    logger.debug('Create User + Member in DB');
    const user = await prisma.user.create({
      data: {
        email,
        kcSub,
        fullName,
        accounts: {
          create: {
            accountId: account.id,
            roleId: role!.id,
          },
        },
      },
      include: {
        accounts: { include: { account: true, role: true } },
      },
    });

    return { user, account };
  }
}

interface AccountsForEmailInput {
  email: string;
}

export async function accountsForEmail({ email }: AccountsForEmailInput) {
  logger.debug('Check email exists in body');
  if (!email) {
    throw {
      status: 400,
      message: 'Email is required',
    };
  }
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: {
        include: {
          account: true,
          role: true,
        },
      },
    },
  });

  if (!user || user.accounts.length === 0) {
    throw {
      status: 404,
      message: 'No accounts found for this email.',
    };
  }

  const accounts = user.accounts.map((a) => ({
    accountName: a.account.name,
    accountUid: a.account.uid,
  }));

  return accounts;
}

interface LoginInput {
  email: string;
  password: string;
  accountUid: string;
}
