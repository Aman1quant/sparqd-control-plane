import { PaginationInfo } from '../_shared/shared.dto';

export interface RegionFilters {
  name?: string;
  page?: number;
  limit?: number;
}

// Cloud Provider DTO
export interface CloudProvider {
  uid: string;
  name: string;
  displayName: string;
}

// Cloud Region DTO
export interface CloudRegion {
  uid: string;
  name: string;
  displayName: string;
  cloudProvider: {
    uid: string;
    name: string;
    displayName: string;
  };
}

// Cloud Region list DTO
export interface CloudRegionList {
  data: CloudRegion[];
  pagination: PaginationInfo;
  serverTime?: string;
}
