-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('AWS');

-- CreateEnum
CREATE TYPE "AccountPlan" AS ENUM ('FREE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "RealmStatus" AS ENUM ('CREATED', 'FINALIZED');

-- CreateEnum
CREATE TYPE "ClusterStatus" AS ENUM ('PENDING', 'CREATING', 'CREATE_FAILED', 'RUNNING', 'UPDATING', 'UPDATE_FAILED', 'STOPPING', 'STOPPED', 'STOP_FAILED', 'DELETING', 'DELETE_FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "AutomationJobStatus" AS ENUM ('PENDING', 'RUNNING', 'RETRYING', 'FAILED', 'COMPLETED', 'CANCELLED', 'TIMEOUT');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "kcSub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "plan" "AccountPlan" NOT NULL DEFAULT 'FREE',
    "kcRealmStatus" "RealmStatus",

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_members" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_invites" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "email" TEXT NOT NULL,
    "invitedById" BIGINT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "token" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_storages" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "storageName" TEXT NOT NULL,
    "providerName" "Provider" NOT NULL,
    "storageConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" BIGINT NOT NULL,

    CONSTRAINT "account_storages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_networks" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "networkName" TEXT NOT NULL,
    "providerName" "Provider" NOT NULL,
    "networkConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" BIGINT NOT NULL,

    CONSTRAINT "account_networks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "storageId" BIGINT NOT NULL,
    "networkId" BIGINT NOT NULL,
    "createdById" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "workspaceId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

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
    "createdById" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_permissions" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" BIGINT,
    "resourceName" TEXT,
    "actions" TEXT[],
    "condition" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_permissions_pkey" PRIMARY KEY ("id")
);

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
    "createdById" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cluster_tshirt_size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clusters" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "workspaceId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ClusterStatus" NOT NULL DEFAULT 'CREATING',
    "statusReason" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "currentConfigId" BIGINT,
    "latestEventId" BIGINT,
    "createdById" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cluster_configs" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "clusterId" BIGINT NOT NULL,
    "version" INTEGER NOT NULL,
    "clusterTshirtSizeId" BIGINT NOT NULL,
    "createdById" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cluster_configs_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "cluster_automation_jobs" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "clusterId" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "AutomationJobStatus" NOT NULL DEFAULT 'PENDING',
    "logsUrl" TEXT,
    "output" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastTriedAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "failReason" TEXT,
    "createdById" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cluster_automation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricings" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFreeTier" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_versions" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "serviceId" BIGINT NOT NULL,
    "version" TEXT NOT NULL,
    "appVersion" TEXT,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "changelog" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_instances" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "clusterId" BIGINT NOT NULL,
    "serviceId" BIGINT NOT NULL,
    "versionId" BIGINT,
    "configId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_configs" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "cpu" DOUBLE PRECISION,
    "memory" DOUBLE PRECISION,
    "disk" DOUBLE PRECISION,
    "metadata" JSONB DEFAULT '{}',
    "createdById" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_billings" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "billingEmail" TEXT NOT NULL,
    "billingName" TEXT,
    "billingAddress" JSONB,
    "taxId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "plan" TEXT NOT NULL DEFAULT 'free',
    "paymentMethod" JSONB,
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "trialEndsAt" TIMESTAMP(3),
    "subscriptionStart" TIMESTAMP(3),
    "subscriptionEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_billings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usages" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "clusterId" BIGINT NOT NULL,
    "service" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "cpu" DOUBLE PRECISION,
    "memory" DOUBLE PRECISION,
    "disk" DOUBLE PRECISION,
    "duration" DOUBLE PRECISION,
    "unitPrice" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_records" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "clusterId" BIGINT NOT NULL,
    "service" TEXT NOT NULL,
    "periodFrom" TIMESTAMP(3) NOT NULL,
    "periodTo" TIMESTAMP(3) NOT NULL,
    "usageCpu" DOUBLE PRECISION,
    "usageMem" DOUBLE PRECISION,
    "usageDisk" DOUBLE PRECISION,
    "cost" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "accountId" BIGINT NOT NULL,
    "accountName" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" BIGINT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uid_key" ON "users"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_kcSub_key" ON "users"("kcSub");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_uid_key" ON "accounts"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "account_members_uid_key" ON "account_members"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "account_members_accountId_userId_key" ON "account_members"("accountId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_invites_uid_key" ON "account_invites"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "account_invites_token_key" ON "account_invites"("token");

-- CreateIndex
CREATE UNIQUE INDEX "account_invites_accountId_email_key" ON "account_invites"("accountId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "account_storages_uid_key" ON "account_storages"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "account_networks_uid_key" ON "account_networks"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_uid_key" ON "workspaces"("uid");

-- CreateIndex
CREATE INDEX "workspaces_accountId_name_idx" ON "workspaces"("accountId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_uid_key" ON "workspace_members"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspaceId_userId_key" ON "workspace_members"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_uid_key" ON "roles"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_uid_key" ON "permissions"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_action_key" ON "permissions"("action");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_uid_key" ON "role_permissions"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "resources_uid_key" ON "resources"("uid");

-- CreateIndex
CREATE INDEX "resources_accountId_type_idx" ON "resources"("accountId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "resources_type_targetId_key" ON "resources"("type", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_permissions_uid_key" ON "resource_permissions"("uid");

-- CreateIndex
CREATE INDEX "resource_permissions_userId_resourceType_resourceId_idx" ON "resource_permissions"("userId", "resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "resource_permissions_userId_resourceType_resourceName_idx" ON "resource_permissions"("userId", "resourceType", "resourceName");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_tshirt_size_uid_key" ON "cluster_tshirt_size"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_tshirt_size_name_key" ON "cluster_tshirt_size"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_tshirt_size_provider_name_key" ON "cluster_tshirt_size"("provider", "name");

-- CreateIndex
CREATE UNIQUE INDEX "clusters_uid_key" ON "clusters"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "clusters_currentConfigId_key" ON "clusters"("currentConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "clusters_latestEventId_key" ON "clusters"("latestEventId");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_configs_uid_key" ON "cluster_configs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_events_uid_key" ON "cluster_events"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_automation_jobs_uid_key" ON "cluster_automation_jobs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "pricings_uid_key" ON "pricings"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "services_uid_key" ON "services"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "services"("name");

-- CreateIndex
CREATE UNIQUE INDEX "service_versions_uid_key" ON "service_versions"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "service_instances_uid_key" ON "service_instances"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "service_configs_uid_key" ON "service_configs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "account_billings_uid_key" ON "account_billings"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "account_billings_accountId_key" ON "account_billings"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "usages_uid_key" ON "usages"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "billing_records_uid_key" ON "billing_records"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_uid_key" ON "audit_logs"("uid");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_members" ADD CONSTRAINT "account_members_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_members" ADD CONSTRAINT "account_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_members" ADD CONSTRAINT "account_members_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_invites" ADD CONSTRAINT "account_invites_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_invites" ADD CONSTRAINT "account_invites_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_storages" ADD CONSTRAINT "account_storages_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_storages" ADD CONSTRAINT "account_storages_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_networks" ADD CONSTRAINT "account_networks_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_networks" ADD CONSTRAINT "account_networks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "account_storages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "account_networks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_permissions" ADD CONSTRAINT "resource_permissions_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_tshirt_size" ADD CONSTRAINT "cluster_tshirt_size_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_currentConfigId_fkey" FOREIGN KEY ("currentConfigId") REFERENCES "cluster_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_latestEventId_fkey" FOREIGN KEY ("latestEventId") REFERENCES "cluster_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clusters" ADD CONSTRAINT "clusters_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_configs" ADD CONSTRAINT "cluster_configs_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_configs" ADD CONSTRAINT "cluster_configs_clusterTshirtSizeId_fkey" FOREIGN KEY ("clusterTshirtSizeId") REFERENCES "cluster_tshirt_size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_configs" ADD CONSTRAINT "cluster_configs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_events" ADD CONSTRAINT "cluster_events_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_automation_jobs" ADD CONSTRAINT "cluster_automation_jobs_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_automation_jobs" ADD CONSTRAINT "cluster_automation_jobs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_versions" ADD CONSTRAINT "service_versions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_instances" ADD CONSTRAINT "service_instances_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_instances" ADD CONSTRAINT "service_instances_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_instances" ADD CONSTRAINT "service_instances_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "service_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_instances" ADD CONSTRAINT "service_instances_configId_fkey" FOREIGN KEY ("configId") REFERENCES "service_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_configs" ADD CONSTRAINT "service_configs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_billings" ADD CONSTRAINT "account_billings_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usages" ADD CONSTRAINT "usages_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_records" ADD CONSTRAINT "billing_records_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
