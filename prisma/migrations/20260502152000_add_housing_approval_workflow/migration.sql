ALTER TYPE "HousingApprovalStatus" ADD VALUE IF NOT EXISTS 'WAITING';
ALTER TYPE "HousingApprovalStatus" ADD VALUE IF NOT EXISTS 'RETURNED';

ALTER TABLE "HousingApproval"
ADD COLUMN IF NOT EXISTS "step" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "action" TEXT,
ADD COLUMN IF NOT EXISTS "approverName" TEXT,
ADD COLUMN IF NOT EXISTS "actedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "HousingApproval_bookingId_step_idx" ON "HousingApproval"("bookingId", "step");
CREATE INDEX IF NOT EXISTS "HousingApproval_status_level_idx" ON "HousingApproval"("status", "level");
