import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { fallbackData } from "../src/lib/demo-data";

type AnyRecord = Record<string, any>;

const data = fallbackData as AnyRecord;

function rowsAt(path: string, minRows = 1) {
  const rows = path.split(".").reduce<any>((current, key) => current?.[key], data);
  assert.ok(Array.isArray(rows), `${path} must be an array`);
  assert.ok(rows.length >= minRows, `${path} needs at least ${minRows} sample row(s)`);
  return rows as AnyRecord[];
}

function includesStatus(path: string, status: string) {
  const rows = rowsAt(path);
  assert.ok(rows.some((row) => row.status === status), `${path} should include status ${status}`);
}

const moduleDatasets: Array<[string, string, number?]> = [
  ["Dashboard / portfolio sites", "sites", 2],
  ["Dashboard / priority work queue", "workOrders", 5],
  ["Service Requests", "requests", 5],
  ["Work Orders", "workOrders", 5],
  ["Job Plans", "jobPlans", 5],
  ["PPM Planner", "ppms", 5],
  ["Locations", "locations", 5],
  ["Assets Management", "assets", 6],
  ["Inventory Management", "inventory", 5],
  ["HSE", "inspections", 3],
  ["Compliance & Certification", "complianceCertificates", 4],
  ["IoT / BMS", "alerts", 3],
  ["Department Codes", "departments", 5],
  ["Service Teams", "teams", 5],
  ["Services Catalog", "services", 6],
  ["Users Management", "users", 6],
  ["Permissions", "permissions", 10],
  ["Roles", "roles", 4],
  ["Role Permissions", "rolePermissions", 4],
  ["Human Resources", "employees", 5],
  ["Activity Logs", "auditLogs", 4],
  ["Housing Properties", "housing.properties", 2],
  ["Housing Blocks", "housing.blocks", 2],
  ["Housing Rooms", "housing.rooms", 6],
  ["Housing Beds", "housing.beds", 8],
  ["Housing Residents", "housing.residents", 4],
  ["Housing Bookings", "housing.bookings", 4],
  ["Housing Inspections", "housing.inspections", 3],
  ["Housing Assets", "housing.assets", 4],
  ["Housing Inventory", "housing.inventory", 4],
  ["Housing Approvals", "housing.approvals", 3],
  ["Housing Notifications", "housing.notifications", 4],
  ["Housing Notification Settings", "housing.notificationSettings", 5],
  ["Housing History", "housing.history", 5],
];

for (const [label, path, minRows] of moduleDatasets) {
  rowsAt(path, minRows);
  console.log(`ok - ${label}`);
}

includesStatus("workOrders", "OPEN");
includesStatus("workOrders", "IN_PROGRESS");
includesStatus("workOrders", "PENDING_SUPERVISOR_REVIEW");
includesStatus("workOrders", "CLOSED");
includesStatus("requests", "PENDING_ASSIGNMENT");
includesStatus("housing.bookings", "PENDING_APPROVAL");
includesStatus("housing.bookings", "CHECKED_IN");
includesStatus("housing.bookings", "CHECKED_OUT");
includesStatus("housing.inspections", "FAILED");
includesStatus("housing.assets", "DAMAGED");
includesStatus("housing.assets", "MISSING");
includesStatus("housing.approvals", "PENDING");

const assetIds = new Set(rowsAt("assets").map((asset) => asset.id));
const serviceCodes = new Set(rowsAt("services").map((service) => service.code));
const teamCodes = new Set(rowsAt("teams").map((team) => team.code));
const roomIds = new Set(rowsAt("housing.rooms").map((room) => room.id));
const bedIds = new Set(rowsAt("housing.beds").map((bed) => bed.id));
const residentIds = new Set(rowsAt("housing.residents").map((resident) => resident.id));

for (const work of rowsAt("workOrders")) {
  if (work.assetId) assert.ok(assetIds.has(work.assetId), `Work order ${work.woNo} references missing asset ${work.assetId}`);
  if (work.serviceCode) assert.ok(serviceCodes.has(work.serviceCode), `Work order ${work.woNo} references missing service ${work.serviceCode}`);
  if (work.assignedTeamCode) assert.ok(teamCodes.has(work.assignedTeamCode), `Work order ${work.woNo} references missing team ${work.assignedTeamCode}`);
}

for (const request of rowsAt("requests")) {
  if (request.serviceCode) assert.ok(serviceCodes.has(request.serviceCode), `Request ${request.ticketNo} references missing service ${request.serviceCode}`);
  if (request.assignedTeamCode) assert.ok(teamCodes.has(request.assignedTeamCode), `Request ${request.ticketNo} references missing team ${request.assignedTeamCode}`);
}

for (const booking of rowsAt("housing.bookings")) {
  assert.ok(roomIds.has(booking.roomId), `Booking ${booking.bookingNo} references missing room ${booking.roomId}`);
  if (booking.bedId) assert.ok(bedIds.has(booking.bedId), `Booking ${booking.bookingNo} references missing bed ${booking.bedId}`);
  if (booking.residentId) assert.ok(residentIds.has(booking.residentId), `Booking ${booking.bookingNo} references missing resident ${booking.residentId}`);
}

const apiRoutes = [
  "assets/route.ts",
  "service-requests/route.ts",
  "work-orders/route.ts",
  "inventory/route.ts",
  "inspections/route.ts",
  "compliance/route.ts",
  "iot-alerts/[id]/route.ts",
  "teams/route.ts",
  "services/route.ts",
  "asset-categories/route.ts",
  "departments/route.ts",
  "job-plans/route.ts",
  "locations/route.ts",
  "ppm/route.ts",
  "users/route.ts",
  "roles/route.ts",
  "employees/route.ts",
  "housing/route.ts",
  "housing/alerts/route.ts",
  "reports/route.ts",
  "templates/[type]/route.ts",
  "bulk-upload/route.ts",
  "operating-data/route.ts",
  "health/route.ts",
];

for (const route of apiRoutes) {
  const path = fileURLToPath(new URL(`../src/app/api/${route}`, import.meta.url));
  assert.ok(existsSync(path), `Missing API route ${route}`);
}

console.log("System smoke tests passed.");
