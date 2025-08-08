import { Prisma, PrismaClient, Workspace } from '@prisma/client';

import logger from '@/config/logger';
import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';

import { DetailWorkspace, UpdateWorkspaceData, WorkspaceFilters } from './workspace.type';
import { detailWorkspaceSelect } from './workspace.select';

const prisma = new PrismaClient();

/******************************************************************************
 * List available workspaces
 *****************************************************************************/
export async function listWorkspace({ userId, name, description, page = 1, limit = 10 }: WorkspaceFilters): Promise<PaginatedResponse<DetailWorkspace>> {
  const whereClause: Record<string, unknown> = {};

  // IMPORTANT: Mandatory filter by userId
  whereClause.members = {
    some: {
      userId,
    },
  };

  // OPTIONALS
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

  logger.debug({ userId }, 'Listing workspaces for a user');

  const [totalData, workspaces] = await Promise.all([
    prisma.workspace.count({ where: whereClause }),
    prisma.workspace.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offsetPagination(page, limit),
      take: limit,
      select: detailWorkspaceSelect,
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

/******************************************************************************
 * Describe a workspace
 *****************************************************************************/
export async function detailWorkspace(uid: string): Promise<DetailWorkspace | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { uid },
    select: detailWorkspaceSelect,
  });

  if (!workspace) {
    throw {
      status: 404,
      message: 'Workspace not found',
    };
  }

  return workspace;
}

export async function createWorkspace(data: Prisma.WorkspaceCreateInput): Promise<Workspace> {
  const accountExists = await prisma.account.findUnique({
    where: { id: data.account.connect?.id },
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

export async function createWorkspaceTx(tx: Prisma.TransactionClient, data: Prisma.WorkspaceCreateInput): Promise<Workspace> {
  const accountExists = await tx.account.findUnique({
    where: { id: data.account.connect?.id },
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

export async function checkWorkspaceExists(uid: string): Promise<Workspace> {
  const workspace = await prisma.workspace.findUnique({
    where: { uid },
  });

  if (!workspace) {
    throw {
      status: 404,
      message: 'Workspace not found',
    };
  }

  return workspace
}
