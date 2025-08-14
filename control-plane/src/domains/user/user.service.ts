import { Prisma, PrismaClient, User } from '@prisma/client';

import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';

import { baseUserSelect, userInternalSessionInfoSelect, userSessionInfoSelect } from './user.select';
import { BaseUser, CreateUserData, UpdateUserData, UserInternalSessionInfo, UserListFilters, UserSessionInfo } from './user.type';

const prisma = new PrismaClient();

export async function listUser({ email, fullName, page = 1, limit = 10 }: UserListFilters): Promise<PaginatedResponse<BaseUser>> {
  const whereClause: Record<string, unknown> = {};

  if (email) {
    whereClause.email = {
      contains: email,
      mode: 'insensitive' as const,
    };
  }

  if (fullName) {
    whereClause.fullName = {
      contains: fullName,
      mode: 'insensitive' as const,
    };
  }

  const [totalData, users] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      skip: offsetPagination(page, limit),
      take: limit,
      select: baseUserSelect,
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: users,
    pagination: {
      currentPage: page,
      totalPages,
      totalData,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function detailUser(uid: string): Promise<BaseUser | null> {
  const user = await prisma.user.findUnique({
    where: { uid },
    select: baseUserSelect,
  });

  if (!user) {
    throw {
      status: 404,
      message: 'User not found',
    };
  }

  return user;
}

export async function createUser(data: CreateUserData): Promise<User> {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw {
      status: 409,
      message: 'User with this email already exists',
    };
  }

  const existingKcUser = await prisma.user.findUnique({
    where: { kcSub: data.kcSub },
  });

  if (existingKcUser) {
    throw {
      status: 409,
      message: 'User with this Keycloak ID already exists',
    };
  }

  const user = await prisma.user.create({ data });

  if (!user) {
    throw {
      status: 500,
      message: 'Failed to create user',
    };
  }

  return user;
}

export async function createUserTx(tx: Prisma.TransactionClient, data: CreateUserData): Promise<User> {
  const existingUser = await tx.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw {
      status: 409,
      message: 'User with this email already exists',
    };
  }

  const existingKcUser = await tx.user.findUnique({
    where: { kcSub: data.kcSub },
  });

  if (existingKcUser) {
    throw {
      status: 409,
      message: 'User with this Keycloak ID already exists',
    };
  }

  const user = await tx.user.create({ data });

  if (!user) {
    throw {
      status: 500,
      message: 'Failed to create user',
    };
  }

  return user;
}

export async function editUser(uid: string, data: UpdateUserData): Promise<BaseUser> {
  const existingUser = await prisma.user.findUnique({
    where: { uid },
  });

  if (!existingUser) {
    throw {
      status: 404,
      message: 'User not found',
    };
  }

  if (data.email && data.email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (emailExists) {
      throw {
        status: 409,
        message: 'User with this email already exists',
      };
    }
  }

  const user = await prisma.user.update({
    where: { uid },
    data,
    select: baseUserSelect,
  });

  return user;
}

export async function deleteUser(uid: string): Promise<BaseUser> {
  const user = await prisma.user.findUnique({
    where: { uid },
  });

  if (!user) {
    throw {
      status: 404,
      message: 'User not found',
    };
  }

  const deletedUser = await prisma.user.delete({
    where: { uid },
  });

  return deletedUser;
}

export async function getUserByEmail(email: string): Promise<BaseUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: baseUserSelect,
  });

  return user;
}

export async function getUserByKcSub(kcSub: string): Promise<UserSessionInfo | null> {
  const user = await prisma.user.findUnique({
    where: { kcSub },
    select: userSessionInfoSelect,
  });
  return user;
}

export async function getInternalUserByKcSub(kcSub: string): Promise<UserInternalSessionInfo | null> {
  const user = await prisma.user.findUnique({
    where: { kcSub },
    select: userInternalSessionInfoSelect,
  });
  return user;
}
