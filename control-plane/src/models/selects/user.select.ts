import { Prisma } from '@prisma/client';

export const userSelect = Prisma.validator<Prisma.UserSelect>()({
  uid: true,
  kcSub: false,
  email: true,
  fullName: true,
  avatarUrl: true,
  createdAt: true,
  accounts: {
    select: {
      account: {
        select: {
          uid: true,
          name: true,
          kcRealmStatus: true,
        },
      },
      role: {
        select: {
          name: true,
        },
      },
    },
  },
  workspaces: true,
  invites: true,
});
