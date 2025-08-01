// import { PaginatedResponse } from '@/models/api/base-response';
// import { offsetPagination } from '@/utils/api';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createAccountStorageTx(tx: Prisma.TransactionClient, input: Prisma.AccountStorageCreateInput) {
  return tx.accountStorage.create({
    data: {
      account: input.account,
      providerName: input.providerName,
      storageName: input.storageName,
      awsRootBucketName: input.awsRootBucketName,
    },
    include: {
      account: true,
    },
  });
}

export async function createAccountStorage(input: Prisma.AccountStorageCreateInput) {
  return prisma.accountStorage.create({
    data: {
      account: input.account,
      providerName: input.providerName,
      storageName: input.storageName,
      awsRootBucketName: input.awsRootBucketName,
    },
    include: {
      account: true,
    },
  });
}
