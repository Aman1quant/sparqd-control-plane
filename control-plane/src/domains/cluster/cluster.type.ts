import { Prisma } from '@prisma/client';

import { clusterCreateResultSelect } from './cluster.select';

// export interface ClusterFilters {
//   name?: string;
//   description?: string;
//   workspaceUid?: string;
//   status?: ClusterStatus;
//   tshirtSize?: string;
//   createdById?: number;
//   page?: number;
//   limit?: number;
// }

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

export interface CreateClusterServiceSelection {
  serviceUid: string;
  serviceVersionUid: string;
}

export interface ClusterCreateRequest {
  name: string;
  description?: string;
  accountUid: string;
  clusterTshirtSizeUid: string;
  serviceSelections: CreateClusterServiceSelection[];
}

export interface ClusterCreateInput {
  name: string;
  description?: string;
  accountUid: string;
  workspaceUid: string;
  clusterTshirtSizeUid: string;
  serviceSelections: CreateClusterServiceSelection[];
  userId: bigint;
}

export type ClusterCreateResult = Prisma.ClusterGetPayload<{
  select: typeof clusterCreateResultSelect;
}>;

// export interface UpdateClusterData {
//   name?: string;
//   description?: string;
//   tshirtSize?: string;
//   status?: ClusterStatus;
//   statusReason?: string;
//   metadata?: object;
// }

// export interface ServiceData {
//   name: string;
// }
// export interface ClusterFilters {
//   name?: string;
//   description?: string;
//   workspaceUid?: string;
//   status?: ClusterStatus;
//   tshirtSize?: string;
//   createdById?: number;
//   page?: number;
//   limit?: number;
// }

// export interface ServiceData {
//   name: string;
// }

// export type DetailCluster = Prisma.ClusterGetPayload<{
//   select: typeof detailClusterSelect;
// }>;

// export type DeletedCluster = Prisma.ClusterGetPayload<{
//   select: typeof deletedClusterSelect;
// }>;
