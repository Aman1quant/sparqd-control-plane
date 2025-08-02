/*
  Warnings:

  - You are about to drop the column `rawSpec` on the `cluster_configs` table. All the data in the column will be lost.
  - You are about to drop the column `services` on the `cluster_configs` table. All the data in the column will be lost.
  - You are about to drop the column `tshirtSize` on the `cluster_configs` table. All the data in the column will be lost.
  - You are about to drop the column `tshirtSize` on the `clusters` table. All the data in the column will be lost.
  - Added the required column `clusterTshirtSizeId` to the `cluster_configs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cluster_configs" DROP COLUMN "rawSpec",
DROP COLUMN "services",
DROP COLUMN "tshirtSize",
ADD COLUMN     "clusterTshirtSizeId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "clusters" DROP COLUMN "tshirtSize";

-- CreateTable
CREATE TABLE "cluster_tshirt_size" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nodeInstanceTypes" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFreeTier" BOOLEAN NOT NULL DEFAULT false,
    "createdById" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cluster_tshirt_size_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cluster_tshirt_size_uid_key" ON "cluster_tshirt_size"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_tshirt_size_name_key" ON "cluster_tshirt_size"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_tshirt_size_provider_name_key" ON "cluster_tshirt_size"("provider", "name");

-- AddForeignKey
ALTER TABLE "cluster_tshirt_size" ADD CONSTRAINT "cluster_tshirt_size_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_configs" ADD CONSTRAINT "cluster_configs_clusterTshirtSizeId_fkey" FOREIGN KEY ("clusterTshirtSizeId") REFERENCES "cluster_tshirt_size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
