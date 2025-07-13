/*
  Warnings:

  - A unique constraint covering the columns `[realm]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `realm` to the `accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_accountId_fkey";

-- DropIndex
DROP INDEX "resource_permissions_userId_resourceType_resourceId_key";

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "realm" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "userEmail" TEXT;

-- AlterTable
ALTER TABLE "resource_permissions" ADD COLUMN     "resourceName" TEXT,
ALTER COLUMN "resourceId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "resources" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" BIGINT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdById" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resources_uid_key" ON "resources"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "resources_type_targetId_key" ON "resources"("type", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_realm_key" ON "accounts"("realm");

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
