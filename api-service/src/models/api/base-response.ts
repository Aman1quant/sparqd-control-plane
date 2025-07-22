export type BaseResponse<T> = {
  code: string;
  message?: string;
  errors: string | null;
  data?: T;
  serverTime: string;
  spanID?: string;
  traceID?: string;
};

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalData: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}
