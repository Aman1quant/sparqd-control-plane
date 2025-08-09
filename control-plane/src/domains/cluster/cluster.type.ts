import { Account, ClusterStatus, Prisma, Workspace } from '@prisma/client';

import { createClusterResultSelect, deletedClusterSelect, detailClusterSelect } from './cluster.select';

export interface CreateClusterServiceSelection {
  serviceUid: string;
  serviceVersionUid: string;
}

export interface CreateClusterInput {
  name: string;
  description?: string;
  account: Account;
  workspace: Workspace;
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

export interface ClusterFilters {
  name?: string;
  description?: string;
  workspaceUid?: string;
  status?: ClusterStatus;
  tshirtSize?: string;
  createdById?: number;
  page?: number;
  limit?: number;
}

export interface ServiceData {
  name: string;
}
export interface ClusterFilters {
  name?: string;
  description?: string;
  workspaceUid?: string;
  status?: ClusterStatus;
  tshirtSize?: string;
  createdById?: number;
  page?: number;
  limit?: number;
}

export interface ServiceData {
  name: string;
}

export type DetailCluster = Prisma.ClusterGetPayload<{
  select: typeof detailClusterSelect;
}>;

export type DeletedCluster = Prisma.ClusterGetPayload<{
  select: typeof deletedClusterSelect;
}>