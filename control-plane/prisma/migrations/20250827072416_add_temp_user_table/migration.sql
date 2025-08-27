-- CreateTable
CREATE TABLE "temp_users" (
    "id" BIGSERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "password" TEXT NOT NULL,
    "lastLoginDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temp_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "temp_users_username_key" ON "temp_users"("username");
