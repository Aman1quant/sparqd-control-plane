import { PaginationInfo } from '../_shared/shared.dto';

export interface ServiceFilters {
  name?: string;
  plan?: string;
  page?: number;
  limit?: number;
}

export interface ServiceVersion {
  uid: string;
  version: string;
  appVersion: string | null;
  releaseDate: Date;
  isActive: boolean;
  isDefault: boolean;
  changelog: string | null;
  createdAt: Date;
}

export interface AvailableService {
  uid: string;
  name: string;
  displayName: string | null;
  description?: string | null;
  isActive: boolean;
  isFreeTier: boolean;
  createdAt: Date;
  updatedAt: Date;
  serviceVersions: ServiceVersion[];
}

export interface AvailableServiceList {
  data: AvailableService[];
  pagination: PaginationInfo;
  serverTime?: string;
}
