/*
  Warnings:

  - A unique constraint covering the columns `[latestEventId]` on the table `clusters` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clusters" ADD COLUMN     "latestEventId" BIGINT;

-- CreateTable
CREATE TABLE "cluster_events" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "clusterId" BIGINT NOT NULL,
    "before" JSONB NOT NULL,
    "after" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cluster_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cluster_events_uid_key" ON "cluster_events"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "clusters_latestEventId_key" ON "clusters"("latestEventId");

-- AddForeignKey
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_latestEventId_fkey" FOREIGN KEY ("latestEventId") REFERENCES "cluster_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_events" ADD CONSTRAINT "cluster_events_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
