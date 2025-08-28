import { PaginationInfo } from '../_shared/shared.dto';
import { CloudRegion } from '../region/region.type';

export interface ClusterTshirtSizeFilters {
  provider?: string;
  name?: string;
  plan?: string;
  description?: string;
  createdById?: bigint;
  page?: number;
  limit?: number;
}

export interface ClusterTshirtSize {
  /**
   * Account storage unique ID
   * @example "83ef9fc3-159c-43fc-a31f-0d4575dc373c"
   */
  uid: string;
  /**
   * Account storage cloud provider name
   * @example "Example Storage"
   */
  name: string;
  /**
   * Cluster instance types
   * @example "['']"
   */
  nodeInstanceTypes: string[];
  /**
   * @example "true"
   */
  isActive: boolean;
  /**
   * @example "false"
   */
  isFreeTier: boolean;
  region: CloudRegion;
}

export interface ClusterTshirtSizeList {
  data: ClusterTshirtSize[];
  pagination: PaginationInfo;
  serverTime?: string;
}
