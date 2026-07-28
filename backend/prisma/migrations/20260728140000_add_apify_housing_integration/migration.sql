-- CreateTable
CREATE TABLE "apify_housing_integrations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "tokenCiphertext" TEXT NOT NULL,
    "actorInput" JSONB NOT NULL DEFAULT '{}',
    "lastImportedAt" TIMESTAMP(3),
    "lastRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apify_housing_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "apify_housing_integrations_tenantId_key" ON "apify_housing_integrations"("tenantId");

-- AddForeignKey
ALTER TABLE "apify_housing_integrations" ADD CONSTRAINT "apify_housing_integrations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
