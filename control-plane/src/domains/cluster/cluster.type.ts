import { Prisma } from '@prisma/client';

import { ClusterStatusEnum, PaginationInfo } from '../_shared/shared.dto';
import { createClusterOutputSelect } from './cluster.select';

export interface ClusterFilters {
  userId: bigint;
  name?: string;
  description?: string;
  workspaceName?: string;
  status?: ClusterStatusEnum;
  tshirtSize?: string;
  page?: number;
  limit?: number;
}

export interface Cluster {
  /**
   * Cluster unique ID
   * @example "83ef9fc3-159c-43fc-a31f-0d4575dc373c"
   */
  uid: string;
  /**
   * Cluster name
   * @example "Example cluster"
   */
  name: string;
  /**
   * Cluster description
   * @example "Example cluster description"
   */
  description?: string | null;
}

export interface ClusterList {
  data: Cluster[];
  pagination: PaginationInfo;
  serverTime?: string;
}

export interface CreateClusterServiceSelection {
  serviceUid: string;
  serviceVersionUid: string;
}

export interface CreateClusterRequest {
  name: string;
  description?: string;
  accountUid: string;
  clusterTshirtSizeUid: string;
  serviceSelections: CreateClusterServiceSelection[];
}

export interface CreateClusterInput {
  name: string;
  description?: string;
  accountUid: string;
  workspaceUid: string;
  clusterTshirtSizeUid: string;
  serviceSelections: CreateClusterServiceSelection[];
  userId: bigint;
}

export type CreateClusterOutput = Prisma.ClusterGetPayload<{
  select: typeof createClusterOutputSelect;
}>;

export interface PartialClusterPatchInput {
  name?: string;
  description?: string | null;
}
