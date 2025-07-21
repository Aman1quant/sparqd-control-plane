import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

// Interface for user creation
interface CreateUserData {
  email: string;
  kcSub: string;
  fullName?: string;
  avatarUrl?: string;
  hasAccountSignedUp?: boolean;
}

// Interface for user update
interface UpdateUserData {
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  hasAccountSignedUp?: boolean;
}

interface UserListFilters {
  email?: string;
  fullName?: string;
  page?: number;
  limit?: number;
}

export async function listUser({ email, fullName, page = 1, limit = 10 }: UserListFilters): Promise<PaginatedResponse<User>> {
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
      include: {
        accounts: {
          include: {
            account: true,
            role: true,
          },
        },
      },
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

export async function detailUser(uid: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { uid },
    include: {
      accounts: {
        include: {
          account: true,
          role: true,
        },
      },
      workspaces: true,
      invites: true,
    },
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

  const user = await prisma.user.create({
    data,
    include: {
      accounts: {
        include: {
          account: true,
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw {
      status: 500,
      message: 'Failed to create user',
    };
  }

  return user;
}

export async function editUser(uid: string, data: UpdateUserData): Promise<User> {
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
    include: {
      accounts: {
        include: {
          account: true,
          role: true,
        },
      },
    },
  });

  return user;
}

export async function deleteUser(uid: string): Promise<User> {
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

export async function getUserByEmail(email: string): Promise<User | null> {
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

  return user;
}

export async function getUserByKcSub(kcSub: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { kcSub },
    include: {
      accounts: {
        include: {
          account: true,
          role: true,
        },
      },
    },
  });

  return user;
}

export async function updateUserSignupStatus(uid: string, hasAccountSignedUp: boolean): Promise<User> {
  const user = await prisma.user.update({
    where: { uid },
    data: { hasAccountSignedUp },
  });

  if (!user) {
    throw {
      status: 404,
      message: 'User not found',
    };
  }

  return user;
}