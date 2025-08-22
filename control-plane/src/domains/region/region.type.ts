import { PaginationInfo } from '../_shared/shared.dto';

export interface RegionFilters {
  name?: string;
  page?: number;
  limit?: number;
}

// Cloud Provider DTO
export interface CloudProvider {
  /**
   * Cloud provider unique ID
   * @example "83ef9fc3-159c-43fc-a31f-0d4575dc373c"
   */
  uid: string;
  /**
   * Cloud provider short name
   * @example "AWS"
   */
  name: string;
  /**
   * * Cloud provider display name
   * @example "AWS"
   */
  displayName: string;
}

// Cloud Region DTO
export interface CloudRegion {
  /**
   * Cloud provider region unique ID
   * @example "83ef9fc3-159c-43fc-a31f-0d4575dc373c"
   */
  uid: string;
  /**
   * @example "ap-southeast-1"
   */
  name: string;
  /**
   * @example "AWS Singapore"
   */
  displayName: string;
  cloudProvider: CloudProvider;
}

// Cloud Region list DTO
export interface CloudRegionList {
  data: CloudRegion[];
  pagination: PaginationInfo;
  serverTime?: string;
}
