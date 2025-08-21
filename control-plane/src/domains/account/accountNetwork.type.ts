import { PaginationInfo } from '../_shared/shared.dto';

export interface AccountNetworkFilters {
  userId: bigint;
  accountUid: string;
  networkName?: string;
  page?: number;
  limit?: number;
}

export interface AccountNetwork {
  /**
   * Account network unique ID
   * @example "83ef9fc3-159c-43fc-a31f-0d4575dc373c"
   */
  uid: string;
  /**
   * Account network name
   * @example "Example VPC"
   */
  networkName: string;
  networkConfig: any;
  createdAt: Date;
}

export interface AccountNetworkList {
  data: AccountNetwork[];
  pagination: PaginationInfo;
  serverTime?: string;
}
