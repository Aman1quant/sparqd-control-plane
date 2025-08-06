import { Prisma } from '@prisma/client';

import { detailAccountSelect } from './account.select';

export interface AccountFilters {
  userId: bigint;
  name?: string;
  page?: number;
  limit?: number;
}

export type DetailAccount = Prisma.AccountGetPayload<{
  select: typeof detailAccountSelect;
}>;
