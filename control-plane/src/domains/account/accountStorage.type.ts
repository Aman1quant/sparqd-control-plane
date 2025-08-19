import { PaginationInfo } from "../_shared/shared.dto";

export interface AccountStorageFilters {
  userId: number;
  accountUid: string;
  storageName?: string;
  page?: number;
  limit?: number;
}

export interface AccountStorage {
  uid: string;
  storageName: string;
  storageConfig: any;
  createdAt: Date;
}

export interface AccountStorageList {
  data: AccountStorage[];
  pagination: PaginationInfo;
  serverTime?: string;
}