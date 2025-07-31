/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `account_billings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `billing_records` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `usages` will be added. If there are existing duplicate values, this will fail.
  - The required column `uid` was added to the `account_billings` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uid` was added to the `billing_records` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uid` was added to the `usages` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "account_billings" ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "billing_records" ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "usages" ADD COLUMN     "uid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "account_billings_uid_key" ON "account_billings"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "billing_records_uid_key" ON "billing_records"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "usages_uid_key" ON "usages"("uid");
