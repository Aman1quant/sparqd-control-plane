/*
  Warnings:

  - Added the required column `releaseDate` to the `service_versions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "service_versions" ADD COLUMN     "releaseDate" TIMESTAMP(3) NOT NULL;
