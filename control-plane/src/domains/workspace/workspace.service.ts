import { Prisma, PrismaClient } from '@prisma/client';

import logger from '@/config/logger';
import { offsetPagination } from '@/utils/api';
import { workspaceSelect } from './workspace.select';
import { PartialWorkspacePatchInput, Workspace, WorkspaceCreateServiceInput, WorkspaceFilters, WorkspaceList } from './workspace.type';
import { HttpError } from '@/types/errors';
import * as RoleService from '@domains/permission/role.service';
import * as WorkspaceMemberService from '@domains/workspace/workspaceMember.service'


const prisma = new PrismaClient();

/******************************************************************************
 * List available workspaces
 *****************************************************************************/
export async function listWorkspaces({ userId, name, description, page = 1, limit = 10 }: WorkspaceFilters): Promise<WorkspaceList> {
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
      select: workspaceSelect,
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
 * Get a workspace
 *****************************************************************************/
export async function getWorkspace(uid: string, userId: bigint): Promise<Workspace | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { uid, members: { some: { userId } } },
    select: workspaceSelect,
  });

  if (!workspace) {
    throw new HttpError(404, 'Workspace not found')
  }

  return workspace;
}

/******************************************************************************
 * Create a workspace
 *****************************************************************************/
export async function createWorkspaceTx(tx: Prisma.TransactionClient, input: WorkspaceCreateServiceInput): Promise<Workspace> {
  const account = await tx.account.findUnique({
    where: { uid: input.accountUid },
  });
  if (!account) { throw new HttpError(404, 'Account not found') }

  const accountStorage = await tx.accountStorage.findUnique({
    where: { uid: input.accountStorageUid },
  });
  if (!accountStorage) { throw new HttpError(404, 'Account Storage not found') }

  const accountNetwork = await tx.accountNetwork.findUnique({
    where: { uid: input.accountNetworkUid },
  });
  if (!accountNetwork) { throw new HttpError(404, 'Account Network not found') }

  const workspace = await tx.workspace.create({
    data: {
      name: input.name,
      description: input.description,
      accountId: account.id,
      storageId: accountStorage.id,
      networkId: accountNetwork.id,
      createdById: input.createdById,
    },
  });

  // Assign as workspace owner
  const workspaceOwnerRole = await RoleService.getRoleByName('WorkspaceOwner');
  await WorkspaceMemberService.createWorkspaceMemberTx(tx, {
    workspaceId: workspace.id,
    userId: input.createdById,
    roleId: workspaceOwnerRole?.id || -1,
  });

  const result = await tx.workspace.findUnique({
    where: { uid: workspace.uid },
    select: workspaceSelect,
  });

  if (!result) { throw new HttpError(500, 'Failed to create workspace') }
  return result
}

/******************************************************************************
 * Patch a workspace
 *****************************************************************************/
export async function patchWorkspace(uid: string, userId: bigint, data: PartialWorkspacePatchInput): Promise<Workspace> {
  logger.debug({ uid, userId }, "patchWorkspace")
  const existingWorkspace = await prisma.workspace.findUnique({
    where: { uid, members: { some: { userId: userId } } },
  });

  if (!existingWorkspace) { throw new HttpError(404, 'Workspace not found') }
  const updatedWorkspace = await prisma.workspace.update({
    where: { uid: existingWorkspace.uid },
    data,
    select: workspaceSelect,
  });

  return updatedWorkspace;
}

/******************************************************************************
 * Delete a workspace
 *****************************************************************************/
export async function deleteWorkspaceTx(tx: Prisma.TransactionClient, uid: string, userId: bigint): Promise<Workspace> {
  const existingWorkspace = await tx.workspace.findUnique({
    where: { uid, members: { some: { userId } } },
  })
  if (!existingWorkspace) { throw new HttpError(404, 'Workspace not found') }

  // Delete workspace membership
  await tx.workspaceMember.deleteMany({
    where: {workspaceId: existingWorkspace.id}
  })

  // Delete workspace
  const workspace = await tx.workspace.delete({
    where: { id: existingWorkspace.id },
    select: workspaceSelect,
  });

  return workspace;
}
