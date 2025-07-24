import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';
import { PrismaClient, Cluster, ClusterStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface ClusterFilters {
  name?: string;
  description?: string;
  workspaceId?: number;
  status?: ClusterStatus;
  tshirtSize?: string;
  createdById?: number;
  page?: number;
  limit?: number;
}

interface CreateClusterData {
  name: string;
  description?: string;
  workspaceId: number;
  tshirtSize: string;
  status?: ClusterStatus;
  statusReason?: string;
  metadata?: object;
  createdById?: bigint;
}

interface UpdateClusterData {
  name?: string;
  description?: string;
  tshirtSize?: string;
  status?: ClusterStatus;
  statusReason?: string;
  metadata?: object;
}

export async function listCluster({
  name,
  description,
  workspaceId,
  status,
  tshirtSize,
  createdById,
  page = 1,
  limit = 10,
}: ClusterFilters): Promise<PaginatedResponse<Cluster>> {
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

  if (workspaceId) {
    whereClause.workspaceId = workspaceId;
  }

  if (status) {
    whereClause.status = status;
  }

  if (tshirtSize) {
    whereClause.tshirtSize = tshirtSize;
  }

  if (createdById) {
    whereClause.createdById = createdById;
  }

  const [totalData, clusters] = await Promise.all([
    prisma.cluster.count({ where: whereClause }),
    prisma.cluster.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offsetPagination(page, limit),
      take: limit,
      include: {
        workspace: {
          select: {
            uid: true,
            name: true,
            account: {
              select: {
                uid: true,
                name: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            uid: true,
            email: true,
            fullName: true,
          },
        },
        currentConfig: {
          select: {
            uid: true,
            version: true,
            tshirtSize: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: clusters,
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

export async function detailCluster(uid: string): Promise<Cluster | null> {
  const cluster = await prisma.cluster.findUnique({
    where: { uid },
    include: {
      workspace: {
        select: {
          uid: true,
          name: true,
          account: {
            select: {
              uid: true,
              name: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          uid: true,
          email: true,
          fullName: true,
        },
      },
      currentConfig: {
        select: {
          uid: true,
          version: true,
          tshirtSize: true,
          rawSpec: true,
        },
      },
      configs: {
        select: {
          uid: true,
          version: true,
          tshirtSize: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      services: {
        select: {
          uid: true,
          service: {
            select: {
              uid: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!cluster) {
    throw {
      status: 404,
      message: 'Cluster not found',
    };
  }

  return cluster;
}

export async function createCluster(data: CreateClusterData): Promise<Cluster> {
  const workspaceExists = await prisma.workspace.findUnique({
    where: { id: data.workspaceId },
  });

  if (!workspaceExists) {
    throw {
      status: 404,
      message: 'Workspace not found',
    };
  }

  const cluster = await prisma.cluster.create({
    data,
  });

  if (!cluster) {
    throw {
      status: 500,
      message: 'Failed to create cluster',
    };
  }

  return cluster;
}

export async function updateCluster(uid: string, data: UpdateClusterData): Promise<Cluster> {
  const existingCluster = await prisma.cluster.findUnique({
    where: { uid },
  });

  if (!existingCluster) {
    throw {
      status: 404,
      message: 'Cluster not found',
    };
  }

  const updatedCluster = await prisma.cluster.update({
    where: { uid },
    data,
  });

  return updatedCluster;
}

export async function deleteCluster(uid: string): Promise<Cluster> {
  const existingCluster = await prisma.cluster.findUnique({
    where: { uid },
  });

  if (!existingCluster) {
    throw {
      status: 404,
      message: 'Cluster not found',
    };
  }

  const deletedCluster = await prisma.cluster.delete({
    where: { uid },
  });

  return deletedCluster;
}
