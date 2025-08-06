import { Prisma } from "@prisma/client";
import { detailAccountSelect } from "../account/account.service";
import { baseUserSelect } from "../user/user.select";

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

export const detailWorkspaceSelect = Prisma.validator<Prisma.WorkspaceSelect>()({
  id: false,
  uid: true,
  name: true,
  description: true,
  account: {
    select: detailAccountSelect,
  },
  createdAt: true,
  createdBy: {
    select: baseUserSelect,
  },
  updatedAt: true,
});

export type DetailWorkspace = Prisma.WorkspaceGetPayload<{
  select: typeof detailWorkspaceSelect;
}>;
