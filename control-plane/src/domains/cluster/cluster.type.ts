import { ClusterStatus, Prisma } from '@prisma/client';

import { createClusterResultSelect } from './cluster.select';

export interface CreateClusterServiceSelection {
  serviceUid: string;
  serviceVersionUid: string;
}

export interface CreateClusterInput {
  name: string;
  description?: string;
  workspaceUid: string;
  clusterTshirtSizeUid: string;
  serviceSelections: CreateClusterServiceSelection[];
  userId: bigint;
}

export type CreateClusterResult = Prisma.ClusterGetPayload<{
  select: typeof createClusterResultSelect;
}>;

export interface UpdateClusterData {
  name?: string;
  description?: string;
  tshirtSize?: string;
  status?: ClusterStatus;
  statusReason?: string;
  metadata?: object;
}
