import { AutomationJobStatus, ClusterAutomationJob, PrismaClient } from '@prisma/client';

import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';

const prisma = new PrismaClient();

interface ClusterAutomationJobFilters {
  clusterId?: number;
  type?: string;
  status?: AutomationJobStatus;
  createdById?: number;
  attempts?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function listClusterAutomationJob({
  clusterId,
  type,
  status,
  createdById,
  attempts,
  dateFrom,
  dateTo,
  page = 1,
  limit = 10,
}: ClusterAutomationJobFilters): Promise<PaginatedResponse<ClusterAutomationJob>> {
  const whereClause: Record<string, unknown> = {};

  if (clusterId) {
    whereClause.clusterId = clusterId;
  }

  if (type) {
    whereClause.type = {
      contains: type,
      mode: 'insensitive' as const,
    };
  }

  if (status) {
    whereClause.status = status;
  }

  if (createdById) {
    whereClause.createdById = createdById;
  }

  if (attempts !== undefined) {
    whereClause.attempts = attempts;
  }

  if (dateFrom || dateTo) {
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom);
    }
    if (dateTo) {
      dateFilter.lte = new Date(dateTo);
    }
    whereClause.createdAt = dateFilter;
  }

  const [totalData, clusterAutomationJobs] = await Promise.all([
    prisma.clusterAutomationJob.count({ where: whereClause }),
    prisma.clusterAutomationJob.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offsetPagination(page, limit),
      take: limit,
      include: {
        cluster: {
          select: {
            uid: true,
            name: true,
            workspace: {
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
      },
    }),
  ]);

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: clusterAutomationJobs,
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

export async function detailClusterAutomationJob(uid: string): Promise<ClusterAutomationJob | null> {
  const clusterAutomationJob = await prisma.clusterAutomationJob.findUnique({
    where: { uid },
    include: {
      cluster: {
        select: {
          uid: true,
          name: true,
          workspace: {
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
    },
  });

  if (!clusterAutomationJob) {
    throw {
      status: 404,
      message: 'Cluster automation job not found',
    };
  }

  return clusterAutomationJob;
}

export async function deleteClusterAutomationJob(uid: string): Promise<ClusterAutomationJob> {
  const existingJob = await prisma.clusterAutomationJob.findUnique({
    where: { uid },
  });

  if (!existingJob) {
    throw {
      status: 404,
      message: 'Cluster automation job not found',
    };
  }

  const deletedJob = await prisma.clusterAutomationJob.delete({
    where: { uid },
  });

  return deletedJob;
}

export async function getJobsByCluster(clusterUid: string): Promise<ClusterAutomationJob[]> {
  const cluster = await prisma.cluster.findUnique({
    where: { uid: clusterUid },
  });

  if (!cluster) {
    throw {
      status: 404,
      message: 'Cluster not found',
    };
  }

  const jobs = await prisma.clusterAutomationJob.findMany({
    where: { clusterId: cluster.id },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: {
          uid: true,
          email: true,
          fullName: true,
        },
      },
    },
  });

  return jobs;
}

export async function retryJob(uid: string): Promise<ClusterAutomationJob> {
  const existingJob = await prisma.clusterAutomationJob.findUnique({
    where: { uid },
  });

  if (!existingJob) {
    throw {
      status: 404,
      message: 'Cluster automation job not found',
    };
  }

  if (existingJob.status !== 'FAILED' && existingJob.status !== 'CANCELLED') {
    throw {
      status: 400,
      message: 'Only failed or cancelled jobs can be retried',
    };
  }

  const updatedJob = await prisma.clusterAutomationJob.update({
    where: { uid },
    data: {
      status: 'PENDING',
      failReason: null,
      lastTriedAt: null,
      nextRetryAt: null,
    },
  });

  return updatedJob;
}

export async function cancelJob(uid: string): Promise<ClusterAutomationJob> {
  const existingJob = await prisma.clusterAutomationJob.findUnique({
    where: { uid },
  });

  if (!existingJob) {
    throw {
      status: 404,
      message: 'Cluster automation job not found',
    };
  }

  if (existingJob.status === 'COMPLETED' || existingJob.status === 'CANCELLED') {
    throw {
      status: 400,
      message: 'Cannot cancel a completed or already cancelled job',
    };
  }

  const updatedJob = await prisma.clusterAutomationJob.update({
    where: { uid },
    data: {
      status: 'CANCELLED',
      lastTriedAt: new Date(),
    },
  });

  return updatedJob;
}
