import { PaginationInfo } from '../_shared/shared.dto';

export interface WorkspaceFilters {
  userId: bigint;
  name?: string;
  description?: string;
  page?: number;
  limit?: number;
}

export interface Workspace {
  uid: string;
  name: string;
  // description?: string;
  // account: {
  //   select: Account,
  // },
  // storage: string,
  // network: true,
  createdAt: Date;
  // createdBy: {
  //   select: createdByUserSelect,
  // },
  updatedAt: Date;
}

export interface WorkspaceList {
  data: Workspace[];
  pagination: PaginationInfo;
  serverTime?: string;
}

export interface WorkspaceCreateInput {
  name: string;
  description?: string | null;
  accountStorageUid: string;
  accountNetworkUid: string;
}

export interface WorkspaceCreateServiceInput {
  name: string;
  description?: string | null;
  createdById: bigint;
  accountUid: string;
  accountStorageUid: string;
  accountNetworkUid: string;
}

export interface PartialWorkspacePatchInput {
  name?: string;
  description?: string | null;
}
