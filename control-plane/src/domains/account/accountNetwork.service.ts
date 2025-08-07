import { Prisma } from '@prisma/client';

export async function createAccountNetworkTx(tx: Prisma.TransactionClient, input: Prisma.AccountNetworkCreateInput) {
  return tx.accountNetwork.create({
    data: {
      account: input.account,
      createdBy: input.createdBy,
      networkName: input.networkName,
      providerName: input.providerName,
      networkConfig: input.networkConfig,
    },
    include: {
      account: true,
    },
  });
}
