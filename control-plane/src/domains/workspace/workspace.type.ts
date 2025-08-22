import { PaginationInfo } from '../_shared/shared.dto';
import { AccountNetwork } from '../account/accountNetwork.type';
import { AccountStorage } from '../account/accountStorage.type';
import { CreatedByInfo } from '../user/user.type';

export interface WorkspaceFilters {
  userId: bigint;
  name?: string;
  description?: string;
  page?: number;
  limit?: number;
}

export interface Workspace {
  /**
   * Workspace unique ID
   * @example "83ef9fc3-159c-43fc-a31f-0d4575dc373c"
   */
  uid: string;
  /**
   * Workspace name
   * @example "Example workspace"
   */
  name: string;
  /**
   * Workspace description
   * @example "Example workspace description"
   */
  description?: string | null;
  storage: AccountStorage;
  network: AccountNetwork;
  createdAt: Date;
  createdBy: CreatedByInfo;
  updatedAt: Date;
}

export interface WorkspaceList {
  data: Workspace[];
  pagination: PaginationInfo;
  serverTime?: string;
}

export interface WorkspaceCreateInput {
  /**
   * Workspace name
   * @example "Example workspace"
   */
  name: string;
  /**
   * Workspace description
   * @example "Example workspace description"
   */
  description?: string | null;
  /**
   * Account unique ID
   * @example "83ef9fc3-159c-43fc-a31f-0d4575dc373c"
   */
  accountUid: string;
  /**
   * Account storage unique ID
   * @example "83ef9fc3-159c-43fc-a31f-0d4575dc373c"
   */
  accountStorageUid: string;
  /**
   * Account network unique ID
   * @example "83ef9fc3-159c-43fc-a31f-0d4575dc373c"
   */
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
