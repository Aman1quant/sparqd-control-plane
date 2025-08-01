-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('AWS');

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "networkId" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "storageId" BIGINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "account_storages" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "storageName" TEXT NOT NULL,
    "providerName" "Provider" NOT NULL,
    "awsRootBucketName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_storages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_networks" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "networkName" TEXT NOT NULL,
    "providerName" "Provider" NOT NULL,
    "awsVpcId" TEXT,
    "awsSubnetIds" TEXT[],
    "awsSecurityGroupIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_networks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_storages_uid_key" ON "account_storages"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "account_networks_uid_key" ON "account_networks"("uid");

-- AddForeignKey
ALTER TABLE "account_storages" ADD CONSTRAINT "account_storages_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_networks" ADD CONSTRAINT "account_networks_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "account_storages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "account_networks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
