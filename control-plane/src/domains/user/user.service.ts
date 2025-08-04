import config from '@/config/config';
import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';
import { Prisma, PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

// Base interface for user selection
export const BaseUserSelect = Prisma.validator<Prisma.UserSelect>()({
  uid: true,
  email: true,
  fullName: true,
  avatarUrl: true,
});

type BaseUser = Prisma.UserGetPayload<{
  select: typeof BaseUserSelect;
}>;

// Interface for user creation
export interface CreateUserData {
  email: string;
  kcSub: string;
  fullName?: string;
  avatarUrl?: string;
}

// Interface for user update
interface UpdateUserData {
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

interface UserListFilters {
  email?: string;
  fullName?: string;
  page?: number;
  limit?: number;
}

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
      select: BaseUserSelect,
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
    select: BaseUserSelect,
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
    select: BaseUserSelect,
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
    select: BaseUserSelect,
  });

  return user;
}

// Type for User with included accounts
export const UserSessionInfoSelect = Prisma.validator<Prisma.UserSelect>()({
  id: false,
  uid: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  createdAt: true,
  accountMembers: {
    select: {
      account: {
        select: {
          uid: true,
          name: true,
          plan: true,
          createdAt: true,
          workspaces: {
            select: {
              uid: true,
              name: true,
              createdAt: true,
              members: {
                select: {
                  role: {
                    select: {
                      uid: true,
                      name: true,
                      description: true,
                    }
                  },
                }
              },
            }
          },
        },
      },
      role: {
        select: {
          uid: true,
          name: true,
          description: true,
        },
      },
    },
  },
})

export type UserSessionInfo = Prisma.UserGetPayload<{
  select: typeof UserSessionInfoSelect;
}>;


export async function getUserByKcSub(kcSub: string): Promise<UserSessionInfo | null> {
  const user = await prisma.user.findUnique({
    where: { kcSub },
    select: UserSessionInfoSelect,
  });

  return user;
}
