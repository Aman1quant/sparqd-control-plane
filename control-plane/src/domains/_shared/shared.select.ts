import { Prisma } from "@prisma/client";

export const createdByUserSelect = Prisma.validator<Prisma.UserSelect>()({
  uid: true,
  email: true,
});
