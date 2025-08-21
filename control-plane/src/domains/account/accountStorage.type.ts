import { PaginationInfo } from '../_shared/shared.dto';
import { CreatedByInfo } from '../user/user.type';

export interface AccountStorageFilters {
  userId: bigint;
  accountUid: string;
  storageName?: string;
  page?: number;
  limit?: number;
}

export interface AccountStorage {
  /**
   * Account storage unique ID
   * @example "83ef9fc3-159c-43fc-a31f-0d4575dc373c"
   */
  uid: string;
  /**
   * Account storage cloud provider name
   * @example "Example Storage"
   */
  providerName: string;
  /**
   * Account storage name
   * @example "Example Storage"
   */
  storageName: string;
  /**
   * Storage type
   * @example "Example Storage"
   */
  type: string;
  /**
   * Storage root path or bucket
   * @example "s3://example-bucket/directory"
   */
  root: string;
  /**
   * Root or bucket subpath for data storage
   * @example "/data"
   */
  dataPath: string;
  /**
   * Root or bucket subpath for workspace assets storage
   * @example "/workspace"
   */
  workspacePath: string;
  /**
   * IAC backend config
   */
  backendConfig: any;
  createdAt: Date;
  createdBy: CreatedByInfo
}

export interface AccountStorageList {
  data: AccountStorage[];
  pagination: PaginationInfo;
  serverTime?: string;
}
