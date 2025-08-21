import { PaginationInfo } from '../_shared/shared.dto';

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
   * Account storage name
   * @example "Example Storage"
   */
  storageName: string;
  storageConfig: any;
  createdAt: Date;
}

export interface AccountStorageList {
  data: AccountStorage[];
  pagination: PaginationInfo;
  serverTime?: string;
}
