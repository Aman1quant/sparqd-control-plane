import { Prisma } from '@prisma/client';

export const workspaceSelect = Prisma.validator<Prisma.WorkspaceSelect>()({
  id: false,
  uid: true,
  name: true,
  description: true,
  // account: {
  //   select: accountSelect,
  // },
  // storage: true,
  // network: true,
  createdAt: true,
  // createdBy: {
  //   select: createdByUserSelect,
  // },
  updatedAt: true,
});
