-- CreateTable
CREATE TABLE "housing_com_integrations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "housingId" TEXT NOT NULL,
    "secretKeyCiphertext" TEXT NOT NULL,
    "lastImportedAt" TIMESTAMP(3),
    "lastFetchedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "housing_com_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "housing_com_integrations_tenantId_key" ON "housing_com_integrations"("tenantId");

-- AddForeignKey
ALTER TABLE "housing_com_integrations" ADD CONSTRAINT "housing_com_integrations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
