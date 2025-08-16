import { AccountPlan as PrismaAccountPlan } from '@prisma/client';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalData: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type AccountPlanEnum = keyof typeof PrismaAccountPlan;
