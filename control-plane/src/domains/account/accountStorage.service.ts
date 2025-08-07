import { Prisma } from '@prisma/client';

export async function createAccountStorageTx(tx: Prisma.TransactionClient, input: Prisma.AccountStorageCreateInput) {
  return tx.accountStorage.create({
    data: {
      account: input.account,
      createdBy: input.createdBy,
      providerName: input.providerName,
      storageName: input.storageName,
      storageConfig: input.storageConfig,
    },
    include: {
      account: true,
    },
  });
}
