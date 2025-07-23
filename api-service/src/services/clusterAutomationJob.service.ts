import { PaginatedResponse } from '@/models/api/base-response';
import { offsetPagination } from '@/utils/api';
import { PrismaClient, ClusterAutomationJob, AutomationJobStatus } from '@prisma/client';

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

interface CreateClusterAutomationJobData {
  clusterId: number;
  type: string;
  status?: AutomationJobStatus;
  logsUrl?: string;
  output?: object;
  attempts?: number;
  lastTriedAt?: Date;
  nextRetryAt?: Date;
  failReason?: string;
  createdById?: number;
}

interface UpdateClusterAutomationJobData {
  type?: string;
  status?: AutomationJobStatus;
  logsUrl?: string;
  output?: object;
  attempts?: number;
  lastTriedAt?: Date;
  nextRetryAt?: Date;
  failReason?: string;
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

export async function createClusterAutomationJob(data: CreateClusterAutomationJobData): Promise<ClusterAutomationJob> {
  const clusterExists = await prisma.cluster.findUnique({
    where: { id: data.clusterId },
  });

  if (!clusterExists) {
    throw {
      status: 404,
      message: 'Cluster not found',
    };
  }

  const clusterAutomationJob = await prisma.clusterAutomationJob.create({
    data,
  });

  if (!clusterAutomationJob) {
    throw {
      status: 500,
      message: 'Failed to create cluster automation job',
    };
  }

  return clusterAutomationJob;
}

export async function updateClusterAutomationJob(uid: string, data: UpdateClusterAutomationJobData): Promise<ClusterAutomationJob> {
  const existingJob = await prisma.clusterAutomationJob.findUnique({
    where: { uid },
  });

  if (!existingJob) {
    throw {
      status: 404,
      message: 'Cluster automation job not found',
    };
  }

  const updatedJob = await prisma.clusterAutomationJob.update({
    where: { uid },
    data,
  });

  return updatedJob;
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

export async function updateJobStatus(uid: string, status: AutomationJobStatus, failReason?: string): Promise<ClusterAutomationJob> {
  const existingJob = await prisma.clusterAutomationJob.findUnique({
    where: { uid },
  });

  if (!existingJob) {
    throw {
      status: 404,
      message: 'Cluster automation job not found',
    };
  }

  const updateData: {
    status: AutomationJobStatus;
    lastTriedAt: Date;
    failReason?: string;
    attempts?: number;
    nextRetryAt?: Date;
  } = {
    status,
    lastTriedAt: new Date(),
  };

  if (status === 'FAILED' && failReason) {
    updateData.failReason = failReason;
  }

  if (status === 'RETRYING') {
    updateData.attempts = existingJob.attempts + 1;
    // Set next retry time (exponential backoff)
    const baseDelay = 60 * 1000; // 1 minute
    const delay = baseDelay * Math.pow(2, existingJob.attempts);
    updateData.nextRetryAt = new Date(Date.now() + delay);
  }

  const updatedJob = await prisma.clusterAutomationJob.update({
    where: { uid },
    data: updateData,
  });

  return updatedJob;
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
