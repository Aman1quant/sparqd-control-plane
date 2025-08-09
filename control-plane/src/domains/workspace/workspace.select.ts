import { Prisma } from '@prisma/client';

import { describeAccountSelect } from '../account/account.select';
import { baseUserSelect } from '../user/user.select';

export const detailWorkspaceSelect = Prisma.validator<Prisma.WorkspaceSelect>()({
  id: false,
  uid: true,
  name: true,
  description: true,
  account: {
    select: describeAccountSelect,
  },
  storage: true,
  network: true,
  createdAt: true,
  createdBy: {
    select: baseUserSelect,
  },
  updatedAt: true,
});
