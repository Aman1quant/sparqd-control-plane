import { Prisma } from '@prisma/client';
import { availableServicesSelect } from './service.select';

export interface ServiceFilters {
  plan: string;
  page?: number;
  limit?: number;
}

export type AvailableServices = Prisma.ServiceGetPayload<{
  select: typeof availableServicesSelect;
}>;
