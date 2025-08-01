// import { PaginatedResponse } from '@/models/api/base-response';
// import { offsetPagination } from '@/utils/api';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createAccountNetworkTx(tx: Prisma.TransactionClient, input: Prisma.AccountNetworkCreateInput) {
  return tx.accountNetwork.create({
    data: {
      account: input.account,
      providerName: input.providerName,
      networkName: input.networkName,
      awsVpcId: input.awsVpcId,
      awsSubnetIds: input.awsSubnetIds,
      awsSecurityGroupIds: input.awsSecurityGroupIds
    },
    include: {
      account: true,
    },
  });
}

export async function createAccountNetwork(input: Prisma.AccountNetworkCreateInput) {
  return prisma.accountNetwork.create({
    data: {
      account: input.account,
      providerName: input.providerName,
      networkName: input.networkName,
      awsVpcId: input.awsVpcId,
      awsSubnetIds: input.awsSubnetIds,
      awsSecurityGroupIds: input.awsSecurityGroupIds
    },
    include: {
      account: true,
    },
  });
}
