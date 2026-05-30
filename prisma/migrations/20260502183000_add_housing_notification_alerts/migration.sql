ALTER TABLE "HousingNotification" ADD COLUMN IF NOT EXISTS "alertType" TEXT;
ALTER TABLE "HousingNotification" ADD COLUMN IF NOT EXISTS "channel" TEXT NOT NULL DEFAULT 'SYSTEM';
ALTER TABLE "HousingNotification" ADD COLUMN IF NOT EXISTS "role" TEXT;
ALTER TABLE "HousingNotification" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'QUEUED';
ALTER TABLE "HousingNotification" ADD COLUMN IF NOT EXISTS "entity" TEXT;
ALTER TABLE "HousingNotification" ADD COLUMN IF NOT EXISTS "entityId" TEXT;
ALTER TABLE "HousingNotification" ADD COLUMN IF NOT EXISTS "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "HousingNotification" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3);
ALTER TABLE "HousingNotification" ADD COLUMN IF NOT EXISTS "deliveryRef" TEXT;

CREATE INDEX IF NOT EXISTS "HousingNotification_alertType_createdAt_idx" ON "HousingNotification"("alertType", "createdAt");
CREATE INDEX IF NOT EXISTS "HousingNotification_status_channel_idx" ON "HousingNotification"("status", "channel");
CREATE INDEX IF NOT EXISTS "HousingNotification_entity_entityId_idx" ON "HousingNotification"("entity", "entityId");

CREATE TABLE IF NOT EXISTS "HousingNotificationSetting" (
  "id" TEXT NOT NULL,
  "alertType" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "roles" TEXT NOT NULL DEFAULT 'Admin,Housing Supervisor',
  "channels" TEXT NOT NULL DEFAULT 'SYSTEM',
  "leadDays" INTEGER NOT NULL DEFAULT 3,
  "thresholdDays" INTEGER NOT NULL DEFAULT 0,
  "severity" "Priority" NOT NULL DEFAULT 'MEDIUM',
  "description" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HousingNotificationSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "HousingNotificationSetting_alertType_key" ON "HousingNotificationSetting"("alertType");
