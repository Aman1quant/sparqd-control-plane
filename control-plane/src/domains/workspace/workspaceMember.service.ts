// import { PaginatedResponse } from '@/models/api/base-response';
// import { offsetPagination } from '@/utils/api';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type CreateWorkspaceMemberData = {
  userId: bigint;
  workspaceId: bigint;
  roleId: number;
};

export async function createWorkspaceMemberTx(tx: Prisma.TransactionClient, input: CreateWorkspaceMemberData) {
  return tx.workspaceMember.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId,
      roleId: input.roleId,
    },
    include: {
      workspace: true,
      role: true,
    },
  });
}

export async function createWorkspaceMember(input: CreateWorkspaceMemberData) {
  return prisma.workspaceMember.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId,
      roleId: input.roleId,
    },
    include: {
      workspace: true,
      role: true,
    },
  });
}
