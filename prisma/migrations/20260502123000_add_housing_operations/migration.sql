DO $$ BEGIN
  CREATE TYPE "HousingBookingStatus" AS ENUM ('REQUESTED','PENDING_APPROVAL','APPROVED','CHECKED_IN','CHECKED_OUT','REJECTED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "HousingInspectionStatus" AS ENUM ('SCHEDULED','IN_PROGRESS','PASSED','FAILED','CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "HousingApprovalStatus" AS ENUM ('PENDING','APPROVED','REJECTED','ESCALATED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "HousingOccupancyStatus" AS ENUM ('AVAILABLE','RESERVED','OCCUPIED','MAINTENANCE','BLOCKED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "HousingProperty" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "site" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "manager" TEXT NOT NULL,
  "totalRooms" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HousingProperty_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HousingBlock" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "floors" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HousingBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HousingRoom" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "roomNumber" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "blockId" TEXT,
  "floor" TEXT NOT NULL,
  "roomType" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  "occupancy" INTEGER NOT NULL DEFAULT 0,
  "status" "HousingOccupancyStatus" NOT NULL DEFAULT 'AVAILABLE',
  "qrCode" TEXT,
  "remarks" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HousingRoom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HousingBed" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "status" "HousingOccupancyStatus" NOT NULL DEFAULT 'AVAILABLE',
  "occupant" TEXT,
  "occupantId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HousingBed_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HousingResident" (
  "id" TEXT NOT NULL,
  "residentNo" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "companyId" TEXT,
  "nationality" TEXT,
  "departmentCode" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HousingResident_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HousingBooking" (
  "id" TEXT NOT NULL,
  "bookingNo" TEXT NOT NULL,
  "residentId" TEXT,
  "residentName" TEXT NOT NULL,
  "departmentCode" TEXT,
  "roomId" TEXT NOT NULL,
  "bedId" TEXT,
  "checkIn" TIMESTAMP(3) NOT NULL,
  "checkOut" TIMESTAMP(3),
  "status" "HousingBookingStatus" NOT NULL DEFAULT 'REQUESTED',
  "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
  "requestedBy" TEXT NOT NULL,
  "approvedBy" TEXT,
  "approvalLevel" TEXT NOT NULL DEFAULT 'Supervisor',
  "attachmentUrls" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HousingBooking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HousingInspection" (
  "id" TEXT NOT NULL,
  "inspectionNo" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "inspector" TEXT NOT NULL,
  "inspectionType" TEXT NOT NULL,
  "status" "HousingInspectionStatus" NOT NULL DEFAULT 'SCHEDULED',
  "score" INTEGER NOT NULL DEFAULT 100,
  "findings" TEXT,
  "photoUrls" TEXT,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HousingInspection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HousingAsset" (
  "id" TEXT NOT NULL,
  "tag" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "roomId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "serialNumber" TEXT,
  "warrantyExpiry" TIMESTAMP(3),
  "qrCode" TEXT,
  "photoUrls" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HousingAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HousingInventory" (
  "id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "roomId" TEXT,
  "onHand" INTEGER NOT NULL DEFAULT 0,
  "reorderPoint" INTEGER NOT NULL DEFAULT 0,
  "unit" TEXT NOT NULL DEFAULT 'Each',
  "qrCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HousingInventory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HousingApproval" (
  "id" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "bookingId" TEXT,
  "level" TEXT NOT NULL,
  "approver" TEXT NOT NULL,
  "status" "HousingApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "remarks" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HousingApproval_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HousingNotification" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "severity" "Priority" NOT NULL DEFAULT 'MEDIUM',
  "recipient" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "bookingId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HousingNotification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HousingHistory" (
  "id" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "roomId" TEXT,
  "bookingId" TEXT,
  "inspectionId" TEXT,
  "assetId" TEXT,
  "inventoryId" TEXT,
  "action" TEXT NOT NULL,
  "actor" TEXT NOT NULL,
  "details" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HousingHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "HousingProperty_code_key" ON "HousingProperty"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "HousingBlock_code_key" ON "HousingBlock"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "HousingRoom_code_key" ON "HousingRoom"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "HousingBed_code_key" ON "HousingBed"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "HousingResident_residentNo_key" ON "HousingResident"("residentNo");
CREATE UNIQUE INDEX IF NOT EXISTS "HousingBooking_bookingNo_key" ON "HousingBooking"("bookingNo");
CREATE UNIQUE INDEX IF NOT EXISTS "HousingInspection_inspectionNo_key" ON "HousingInspection"("inspectionNo");
CREATE UNIQUE INDEX IF NOT EXISTS "HousingAsset_tag_key" ON "HousingAsset"("tag");
CREATE UNIQUE INDEX IF NOT EXISTS "HousingInventory_sku_key" ON "HousingInventory"("sku");
CREATE INDEX IF NOT EXISTS "HousingBooking_roomId_status_idx" ON "HousingBooking"("roomId", "status");
CREATE INDEX IF NOT EXISTS "HousingBooking_bedId_status_idx" ON "HousingBooking"("bedId", "status");

ALTER TABLE "HousingBlock" ADD CONSTRAINT "HousingBlock_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "HousingProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HousingRoom" ADD CONSTRAINT "HousingRoom_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "HousingProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HousingRoom" ADD CONSTRAINT "HousingRoom_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "HousingBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HousingBed" ADD CONSTRAINT "HousingBed_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "HousingRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HousingBooking" ADD CONSTRAINT "HousingBooking_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "HousingResident"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HousingBooking" ADD CONSTRAINT "HousingBooking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "HousingRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HousingBooking" ADD CONSTRAINT "HousingBooking_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "HousingBed"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HousingInspection" ADD CONSTRAINT "HousingInspection_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "HousingRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HousingAsset" ADD CONSTRAINT "HousingAsset_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "HousingRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HousingInventory" ADD CONSTRAINT "HousingInventory_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "HousingRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HousingApproval" ADD CONSTRAINT "HousingApproval_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "HousingBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HousingNotification" ADD CONSTRAINT "HousingNotification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "HousingBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HousingHistory" ADD CONSTRAINT "HousingHistory_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "HousingRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HousingHistory" ADD CONSTRAINT "HousingHistory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "HousingBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HousingHistory" ADD CONSTRAINT "HousingHistory_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "HousingInspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HousingHistory" ADD CONSTRAINT "HousingHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "HousingAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HousingHistory" ADD CONSTRAINT "HousingHistory_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "HousingInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
