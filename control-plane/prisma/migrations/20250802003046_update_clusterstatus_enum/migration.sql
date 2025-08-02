/*
  Warnings:

  - The values [STARTING,RESTARTING,FAILED] on the enum `ClusterStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ClusterStatus_new" AS ENUM ('PENDING', 'CREATING', 'CREATE_FAILED', 'RUNNING', 'UPDATING', 'UPDATE_FAILED', 'STOPPING', 'STOPPED', 'STOP_FAILED', 'DELETING', 'DELETE_FAILED', 'DELETED');
ALTER TABLE "clusters" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "clusters" ALTER COLUMN "status" TYPE "ClusterStatus_new" USING ("status"::text::"ClusterStatus_new");
ALTER TYPE "ClusterStatus" RENAME TO "ClusterStatus_old";
ALTER TYPE "ClusterStatus_new" RENAME TO "ClusterStatus";
DROP TYPE "ClusterStatus_old";
ALTER TABLE "clusters" ALTER COLUMN "status" SET DEFAULT 'CREATING';
COMMIT;
