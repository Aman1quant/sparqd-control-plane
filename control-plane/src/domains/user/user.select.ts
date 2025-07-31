import { Prisma } from '@prisma/client';

export const userSelect = Prisma.validator<Prisma.UserSelect>()({
  uid: true,
  kcSub: false,
  email: true,
  fullName: true,
  avatarUrl: true,
  createdAt: true,
});

export type UserDetail = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;
