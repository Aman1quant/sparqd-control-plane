import { Prisma } from '@prisma/client';
import { accountSelect } from '../account/account.select';
import { createdByUserSelect } from '../_shared/shared.select';

// import { describeAccountSelect } from '../account/account.select';
// import { baseUserSelect } from '../user/user.select';

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
