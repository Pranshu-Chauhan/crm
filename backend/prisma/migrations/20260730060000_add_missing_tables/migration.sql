-- CreateTable: subscriptions
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "razorpaySubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: housing_com_integrations
CREATE TABLE IF NOT EXISTS "housing_com_integrations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "housingId" TEXT NOT NULL,
    "secretKeyCiphertext" TEXT NOT NULL,
    "lastImportedAt" TIMESTAMP(3),
    "lastFetchedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "housing_com_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: apify_housing_integrations
CREATE TABLE IF NOT EXISTS "apify_housing_integrations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "tokenCiphertext" TEXT NOT NULL,
    "actorInput" JSONB NOT NULL DEFAULT '{}',
    "lastImportedAt" TIMESTAMP(3),
    "lastRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apify_housing_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_tenantId_key" ON "subscriptions"("tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "housing_com_integrations_tenantId_key" ON "housing_com_integrations"("tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "apify_housing_integrations_tenantId_key" ON "apify_housing_integrations"("tenantId");

-- AddForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_tenantId_fkey";
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "housing_com_integrations" DROP CONSTRAINT IF EXISTS "housing_com_integrations_tenantId_fkey";
ALTER TABLE "housing_com_integrations" ADD CONSTRAINT "housing_com_integrations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "apify_housing_integrations" DROP CONSTRAINT IF EXISTS "apify_housing_integrations_tenantId_fkey";
ALTER TABLE "apify_housing_integrations" ADD CONSTRAINT "apify_housing_integrations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
