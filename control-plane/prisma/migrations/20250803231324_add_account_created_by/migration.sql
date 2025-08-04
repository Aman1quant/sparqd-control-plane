-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "createdById" BIGINT;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
