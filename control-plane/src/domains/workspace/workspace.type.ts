import { Prisma } from '@prisma/client';

import { detailWorkspaceSelect } from './workspace.select';

export interface WorkspaceFilters {
  userId: bigint;
  name?: string;
  description?: string;
  page?: number;
  limit?: number;
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  metadata?: object;
}

export type DetailWorkspace = Prisma.WorkspaceGetPayload<{
  select: typeof detailWorkspaceSelect;
}>;
