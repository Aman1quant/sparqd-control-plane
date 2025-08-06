import { Prisma } from "@prisma/client";

export const availableServicesSelect = Prisma.validator<Prisma.ServiceSelect>()({
  id: false,
  uid: true,
  name: true,
  displayName: true,
  description: true,
  isActive: true,
  isFreeTier: true,
  createdAt: true,
  updatedAt: true,
  serviceVersions: {
    select: {
      id: false,
      uid: true,
      version: true,
      appVersion: true,
      releaseDate: true,
      isActive: true,
      isDefault: true,
      changelog: true,
      createdAt: true,
    },
  },
});