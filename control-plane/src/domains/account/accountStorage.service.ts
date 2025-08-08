import { Prisma } from '@prisma/client';

export async function createAccountStorageTx(tx: Prisma.TransactionClient, input: Prisma.AccountStorageCreateInput) {
  return tx.accountStorage.create({
    data: {
      account: input.account,
      createdBy: input.createdBy,
      storageName: input.storageName,
      storageConfig: input.storageConfig,
    },
    include: {
      account: true,
    },
  });
}
