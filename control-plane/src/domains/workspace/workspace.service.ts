import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';
import { Prisma, PrismaClient, Workspace } from '@prisma/client';

const prisma = new PrismaClient();

interface WorkspaceFilters {
  name?: string;
  description?: string;
  accountId?: number;
  createdById?: number;
  page?: number;
  limit?: number;
}

interface CreateWorkspaceData {
  name: string;
  description?: string;
  accountId: bigint;
  createdById?: bigint;
  metadata?: object;
}

interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  metadata?: object;
}

export async function listWorkspace({
  name,
  description,
  accountId,
  createdById,
  page = 1,
  limit = 10,
}: WorkspaceFilters): Promise<PaginatedResponse<Workspace>> {
  const whereClause: Record<string, unknown> = {};

  if (name) {
    whereClause.name = {
      contains: name,
      mode: 'insensitive' as const,
    };
  }

  if (description) {
    whereClause.description = {
      contains: description,
      mode: 'insensitive' as const,
    };
  }

  if (accountId) {
    whereClause.accountId = accountId;
  }

  if (createdById) {
    whereClause.createdById = createdById;
  }

  const [totalData, workspaces] = await Promise.all([
    prisma.workspace.count({ where: whereClause }),
    prisma.workspace.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offsetPagination(page, limit),
      take: limit,
      include: {
        account: {
          select: {
            uid: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            uid: true,
            email: true,
            fullName: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: workspaces,
    pagination: {
      totalData,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function detailWorkspace(uid: string): Promise<Workspace | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { uid },
    include: {
      account: {
        select: {
          uid: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          uid: true,
          email: true,
          fullName: true,
        },
      },
    },
  });

  if (!workspace) {
    throw {
      status: 404,
      message: 'Workspace not found',
    };
  }

  return workspace;
}

export async function createWorkspace(data: CreateWorkspaceData): Promise<Workspace> {
  const accountExists = await prisma.account.findUnique({
    where: { id: data.accountId },
  });

  if (!accountExists) {
    throw {
      status: 404,
      message: 'Account not found',
    };
  }

  const workspace = await prisma.workspace.create({
    data,
  });

  if (!workspace) {
    throw {
      status: 500,
      message: 'Failed to create workspace',
    };
  }

  return workspace;
}

export async function createWorkspaceTx(tx: Prisma.TransactionClient, data: CreateWorkspaceData): Promise<Workspace> {
  const accountExists = await tx.account.findUnique({
    where: { id: data.accountId },
  });

  if (!accountExists) {
    throw {
      status: 404,
      message: 'Account not found',
    };
  }

  const workspace = await tx.workspace.create({
    data,
  });

  if (!workspace) {
    throw {
      status: 500,
      message: 'Failed to create workspace',
    };
  }

  return workspace;
}

export async function updateWorkspace(uid: string, data: UpdateWorkspaceData): Promise<Workspace> {
  const existingWorkspace = await prisma.workspace.findUnique({
    where: { uid },
  });

  if (!existingWorkspace) {
    throw {
      status: 404,
      message: 'Workspace not found',
    };
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: { uid },
    data,
  });

  return updatedWorkspace;
}

export async function deleteWorkspace(uid: string): Promise<Workspace> {
  const existingWorkspace = await prisma.workspace.findUnique({
    where: { uid },
  });

  if (!existingWorkspace) {
    throw {
      status: 404,
      message: 'Workspace not found',
    };
  }

  const deletedWorkspace = await prisma.workspace.delete({
    where: { uid },
  });

  return deletedWorkspace;
}
