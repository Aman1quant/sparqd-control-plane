import { PaginationInfo } from "../_shared/shared.dto";

export interface AccountNetworkFilters {
  userId: number;
  accountUid: string;
  networkName?: string;
  page?: number;
  limit?: number;
}

export interface AccountNetwork {
  uid: string;
  networkName: string;
  networkConfig: any;
  createdAt: Date;
}

export interface AccountNetworkList {
  data: AccountNetwork[];
  pagination: PaginationInfo;
  serverTime?: string;
}