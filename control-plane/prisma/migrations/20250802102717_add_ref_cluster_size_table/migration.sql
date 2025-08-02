-- CreateTable
CREATE TABLE "ref_cluster_tshirt_size" (
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

    CONSTRAINT "ref_cluster_tshirt_size_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ref_cluster_tshirt_size_uid_key" ON "ref_cluster_tshirt_size"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "ref_cluster_tshirt_size_name_key" ON "ref_cluster_tshirt_size"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ref_cluster_tshirt_size_provider_name_key" ON "ref_cluster_tshirt_size"("provider", "name");

-- AddForeignKey
ALTER TABLE "ref_cluster_tshirt_size" ADD CONSTRAINT "ref_cluster_tshirt_size_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
