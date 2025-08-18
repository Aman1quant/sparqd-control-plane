import { PaginationInfo } from '../_shared/shared.dto';

export interface RegionFilters {
  name?: string;
  page?: number;
  limit?: number;
}

export interface CloudProvider {
  uid: string;
  name: string;
  displayName: string;
}

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

export interface CloudRegionList {
  data: CloudRegion[];
  pagination: PaginationInfo;
  serverTime?: string;
}
