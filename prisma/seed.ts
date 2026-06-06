import { addDays, subDays } from "date-fns";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetOperationalData() {
  await prisma.housingHistory.deleteMany({});
  await prisma.housingNotification.deleteMany({});
  await prisma.housingApproval.deleteMany({});
  await prisma.housingInventory.deleteMany({});
  await prisma.housingAsset.deleteMany({});
  await prisma.housingInspection.deleteMany({});
  await prisma.housingBooking.deleteMany({});
  await prisma.housingResident.deleteMany({});
  await prisma.housingBed.deleteMany({});
  await prisma.housingRoom.deleteMany({});
  await prisma.housingBlock.deleteMany({});
  await prisma.housingProperty.deleteMany({});
  await prisma.inventoryIssue.deleteMany({});
  await prisma.meter.deleteMany({});
  await prisma.iotAlert.deleteMany({});
  await prisma.hseIncident.deleteMany({});
  await prisma.inspection.deleteMany({});
  await prisma.complianceCertificate.deleteMany({});
  await prisma.preventiveMaintenance.deleteMany({});
  await prisma.workOrder.deleteMany({});
  await prisma.serviceRequest.deleteMany({});
  await prisma.assetHistory.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.space.deleteMany({});
  await prisma.building.deleteMany({});
  await prisma.site.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.jobPlan.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.contract.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.serviceCatalog.deleteMany({});
  await prisma.assetCategory.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.team.deleteMany({ where: { users: { none: {} } } });
}

async function main() {
  const passwordHash = await bcrypt.hash("cafm12345", 10);
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@cafm.local" },
    update: { passwordHash: adminPasswordHash, role: "Admin", active: true },
    create: {
      name: "System Administrator",
      email: "admin@cafm.local",
      role: "Admin",
      department: "Administration",
      passwordHash: adminPasswordHash,
      active: true,
    },
  });

  const standardRoles = [
    ["Admin", "Full system administration and configuration"],
    ["Department Supervisor", "Department-restricted request review, conversion, work assignment and PPM visibility"],
    ["Supervisor", "Department supervision, request conversion and work assignment"],
    ["Service Team", "Assigned work execution, status, time, photos and material usage"],
    ["Technician", "Execute assigned tasks only"],
    ["Helpdesk", "Request intake, triage and communication"],
    ["Reception", "Front-desk resident and visitor service request intake"],
    ["Resident", "Resident portal request submission and request tracking"],
    ["Requester", "Create and track service requests"],
    ["Read-only", "View-only access to assets, work orders, history and reports"],
  ] as const;

  for (const [name, description] of standardRoles) {
    await prisma.role.upsert({
      where: { name },
      update: { description, standard: true },
      create: { name, description, standard: true },
    });
  }

  const permissions = [
    ["assets.manage", "Manage Assets", "Assets", "Create, edit, import and view asset history"],
    ["work.manage", "Manage Work Orders", "Work", "Create and update work orders"],
    ["work.execute", "Execute Work Orders", "Work", "Update status, time, photos, assets and inventory used"],
    ["requests.manage", "Manage Service Requests", "Helpdesk", "Create, edit, assign and convert requests to work orders"],
    ["requests.approve", "Approve or Reject Requests", "Helpdesk", "Supervisor/helpdesk review, validate, approve or reject service requests"],
    ["requests.view", "View Service Requests", "Helpdesk", "View assigned service requests"],
    ["work.assign", "Assign Work Orders", "Work", "Assign work orders to technicians or teams"],
    ["work.verify", "Verify Completed Work", "Work", "Approve, reject, reopen or close completed work"],
    ["ppm.manage", "Manage PPM", "Maintenance", "Create planned preventive maintenance schedules"],
    ["users.manage", "Manage Users", "Administration", "Create users and assign roles"],
    ["roles.manage", "Manage Roles", "Administration", "Create custom roles and permission sets"],
    ["reports.view", "View Reports", "Reports", "Preview and download reports"],
    ["assets.view", "View Assets", "Assets", "View asset register, history and location drill-down"],
    ["work.view", "View Work Orders", "Work", "View work order panels and completion history"],
    ["reception.manage", "Reception Desk", "Reception", "Create resident requests and view front-desk queue"],
    ["resident.portal", "Resident Portal", "Resident", "Create and track own requests"],
    ["housing.manage", "Manage Housing Operations", "Housing", "Create and manage accommodation, bookings, inspections, assets and inventory"],
    ["housing.approve", "Approve Housing Requests", "Housing", "Approve or reject housing bookings and escalations"],
    ["housing.view", "View Housing", "Housing", "View housing dashboards, room history, reports and alerts"],
    ["compliance.manage", "Manage Compliance & Certification", "Compliance", "Create and renew statutory certificates, permits and regulatory audits"],
    ["compliance.view", "View Compliance & Certification", "Compliance", "View compliance dashboard, certificate register, expiry alerts and reports"],
  ] as const;

  for (const [code, name, module, description] of permissions) {
    const permission = await prisma.permission.upsert({
      where: { code },
      update: { name, module, description },
      create: { code, name, module, description },
    });
    await prisma.rolePermission.upsert({
      where: { role_permissionId: { role: "Admin", permissionId: permission.id } },
      update: {},
      create: { role: "Admin", permissionId: permission.id },
    });
  }

  const defaultRolePermissions: Record<string, string[]> = {
    Supervisor: ["work.manage", "work.assign", "work.verify", "work.execute", "requests.manage", "requests.approve", "requests.view", "housing.manage", "housing.approve", "housing.view", "compliance.manage", "compliance.view", "reports.view"],
    "Department Supervisor": ["work.manage", "work.assign", "work.verify", "work.execute", "requests.manage", "requests.approve", "requests.view", "ppm.manage", "housing.manage", "housing.approve", "housing.view", "compliance.manage", "compliance.view", "reports.view"],
    "Service Team": ["work.execute", "requests.view", "housing.view", "compliance.view"],
    Technician: ["work.execute", "requests.view"],
    Helpdesk: ["requests.manage", "requests.approve", "requests.view", "housing.view", "compliance.view", "reports.view"],
    Reception: ["reception.manage", "requests.manage", "requests.view", "housing.manage", "housing.view", "compliance.view"],
    Resident: ["resident.portal", "requests.view", "housing.view"],
    Requester: ["resident.portal", "requests.view"],
    "Read-only": ["assets.view", "work.view", "requests.view", "reports.view", "housing.view", "compliance.view"],
  };

  for (const [role, codes] of Object.entries(defaultRolePermissions)) {
    const linkedPermissions = await prisma.permission.findMany({ where: { code: { in: codes } } });
    for (const permission of linkedPermissions) {
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role, permissionId: permission.id } },
        update: {},
        create: { role, permissionId: permission.id },
      });
    }
  }

  const users = await Promise.all(
    [
      ["Mariam Al-Fahad", "mariam@brightworks.local", "Facility Director", "Operations"],
      ["Omar Siddiqui", "omar@brightworks.local", "Helpdesk Manager", "Tenant Services"],
      ["Adeel Khan", "adeel@brightworks.local", "Technician", "MEP"],
      ["Sara Malik", "sara@brightworks.local", "Technician", "Life Safety"],
      ["Lina Haddad", "lina@brightworks.local", "Supervisor", "HOUSING"],
      ["Faisal Noor", "faisal@brightworks.local", "Technician", "HOUSING"],
    ].map(([name, email, role, department]) =>
      prisma.user.upsert({
        where: { email },
        update: {},
        create: { name, email, role, department, passwordHash },
      }),
    ),
  );
  users.unshift(admin);
  const userByEmail = Object.fromEntries(users.map((user) => [user.email, user]));

  await resetOperationalData();

  const mepTeam = await prisma.team.upsert({
    where: { code: "MEP" },
    update: {},
    create: {
      code: "MEP",
      name: "MEP Response Team",
      type: "Hard Services",
      supervisor: "Adeel Khan",
      phone: "+966 500000001",
      email: "mep@brightworks.local",
      shift: "24/7",
      coverage: "All towers and plant rooms",
    },
  });
  const electricalTeam = await prisma.team.upsert({
    where: { code: "ELEC" },
    update: { email: "electrical@reserve.local" },
    create: {
      code: "ELEC",
      name: "Electrical Response Team",
      type: "Hard Services",
      supervisor: "Mariam Al-Fahad",
      phone: "+966 500000002",
      email: "electrical@reserve.local",
      shift: "Day + On-call",
      coverage: "Electrical rooms, DBs, generators and UPS",
    },
  });
  const civilTeam = await prisma.team.upsert({
    where: { code: "CIVIL" },
    update: { email: "civil@reserve.local" },
    create: {
      code: "CIVIL",
      name: "Civil & Fitout Team",
      type: "Soft / Civil Services",
      supervisor: "Omar Siddiqui",
      phone: "+966 500000003",
      email: "civil@reserve.local",
      shift: "Day shift",
      coverage: "Finishes, doors, ceilings, rooms and occupancy support",
    },
  });
  const housekeepingTeam = await prisma.team.upsert({
    where: { code: "HK" },
    update: { email: "housekeeping@reserve.local" },
    create: {
      code: "HK",
      name: "Housekeeping Team",
      type: "Soft Services",
      supervisor: "Omar Siddiqui",
      phone: "+966 500000004",
      email: "housekeeping@reserve.local",
      shift: "Two shifts",
      coverage: "Public areas, offices, washrooms and pantry spaces",
    },
  });
  const housingTeam = await prisma.team.upsert({
    where: { code: "HSG" },
    update: { email: "housing@reserve.local" },
    create: {
      code: "HSG",
      name: "Housing Operations Team",
      type: "Accommodation Services",
      supervisor: "Lina Haddad",
      phone: "+966 500000005",
      email: "housing@reserve.local",
      shift: "24/7 reception + day maintenance",
      coverage: "Accommodation, room readiness, check-in support and resident maintenance",
    },
  });

  await Promise.all([
    prisma.user.update({ where: { email: "adeel@brightworks.local" }, data: { teamId: mepTeam.id } }),
    prisma.user.update({ where: { email: "sara@brightworks.local" }, data: { teamId: mepTeam.id } }),
    prisma.user.update({ where: { email: "lina@brightworks.local" }, data: { teamId: housingTeam.id } }),
    prisma.user.update({ where: { email: "faisal@brightworks.local" }, data: { teamId: housingTeam.id } }),
  ]);

  await Promise.all(
    [
      ["MEP", "MEP Department", "Tower A", "Mechanical, electrical and plumbing services."],
      ["ELEC", "Electrical Department", "Tower A", "Power distribution, lighting, UPS, generators and panels."],
      ["CIVIL", "Civil Department", "Tower A", "Fitout, finishes, rooms, doors and small civil repairs."],
      ["HK", "Housekeeping Department", "Tower A", "Cleaning, waste, pantry and public area upkeep."],
      ["SEC", "Security Department", "Tower A", "Access control, visitor support and security equipment coordination."],
      ["HOUSING", "Housing Operations", "Jazan Operations Camp", "Accommodation, occupancy, room readiness and resident services."],
    ].map(([code, name, siteLocation, description]) =>
      prisma.department.upsert({
        where: { code },
        update: { name, siteLocation, description },
        create: { code, name, siteLocation, description },
      }),
    ),
  );

  await Promise.all(
    [
      ["Adeel Khan", "adeel.employee@brightworks.local", "EMP-001", "Resident", "MEP", "Tower A"],
      ["Sara Malik", "sara.employee@brightworks.local", "EMP-002", "Saudi", "FLS", "Tower A"],
      ["Faisal Noor", "faisal.employee@brightworks.local", "EMP-003", "Resident", "HOUSING", "Jazan Operations Camp"],
      ["Lina Haddad", "lina.employee@brightworks.local", "EMP-004", "Saudi", "HOUSING", "Jazan Operations Camp"],
      ["Ravi Thomas", "ravi.employee@brightworks.local", "EMP-005", "Resident", "HK", "Tower A"],
    ].map(([name, email, companyId, nationalityType, departmentCode, siteLocation]) =>
      prisma.employee.upsert({
        where: { companyId },
        update: { email, nationalityType, departmentCode, siteLocation },
        create: { name, email, companyId, nationalityType, departmentCode, siteLocation },
      }),
    ),
  );

  await prisma.assetCategory.upsert({
    where: { code: "HVAC" },
    update: {},
    create: {
      code: "HVAC",
      name: "HVAC Equipment",
      type: "MEP",
      defaultLifeYrs: 15,
      statutory: false,
      description: "Cooling, heating and ventilation equipment.",
    },
  });
  await Promise.all(
    [
      ["ELEC", "Electrical Equipment", "Electrical", 20, false, "Panels, DBs, UPS, lighting and generators."],
      ["PLUMB", "Plumbing Equipment", "Plumbing", 15, false, "Pumps, tanks, valves and domestic water assets."],
      ["FLS", "Fire & Life Safety", "Life Safety", 12, true, "Fire pumps, panels, extinguishers and emergency systems."],
      ["FURN", "Furniture & Fixtures", "Civil", 10, false, "Furniture, fixtures, room equipment and occupancy assets."],
      ["IT", "IT Infrastructure", "IT", 7, false, "Network racks, access points, CCTV and IT devices."],
      ["HSG", "Housing Room Equipment", "Accommodation", 8, false, "Resident room AC units, appliances and accommodation fixtures."],
    ].map(([code, name, type, defaultLifeYrs, statutory, description]) =>
      prisma.assetCategory.upsert({
        where: { code: String(code) },
        update: {},
        create: {
          code: String(code),
          name: String(name),
          type: String(type),
          defaultLifeYrs: Number(defaultLifeYrs),
          statutory: Boolean(statutory),
          description: String(description),
        },
      }),
    ),
  );

  await prisma.serviceCatalog.upsert({
    where: { code: "HVAC-REQ" },
    update: {},
    create: {
      code: "HVAC-REQ",
      name: "HVAC Complaint",
      category: "HVAC",
      type: "Reactive",
      priority: "HIGH",
      slaHours: 12,
      teamId: mepTeam.id,
      description: "Temperature, ventilation and indoor air quality requests.",
    },
  });
  await Promise.all(
    [
      ["ELEC-REQ", "Electrical Fault", "Electrical", "Reactive", "HIGH", 8, electricalTeam.id, "Lighting, power socket, panel and breaker faults."],
      ["PLUMB-REQ", "Plumbing Leak", "Plumbing", "Reactive", "CRITICAL", 4, mepTeam.id, "Leaks, blockages, valves, pumps and water system faults."],
      ["CIVIL-REQ", "Civil Repair", "Civil", "Reactive", "MEDIUM", 24, civilTeam.id, "Doors, ceilings, gypsum, paint, flooring and furniture defects."],
      ["HK-REQ", "Housekeeping Request", "Housekeeping", "Service", "LOW", 12, housekeepingTeam.id, "Cleaning, waste removal, spills and pantry service."],
      ["SEC-REQ", "Access Control", "Security", "Reactive", "MEDIUM", 12, electricalTeam.id, "Access reader, door maglock and security system coordination."],
      ["HOUSING-MAINT", "Housing Maintenance", "Housing Maintenance", "Reactive", "HIGH", 6, housingTeam.id, "Resident accommodation room and camp maintenance."],
      ["HOUSING-CLEAN", "Housing Housekeeping", "Housing Housekeeping", "Service", "MEDIUM", 8, housingTeam.id, "Room cleaning, readiness and turnover services."],
    ].map(([code, name, category, type, priority, slaHours, teamId, description]) =>
      prisma.serviceCatalog.upsert({
        where: { code: String(code) },
        update: {},
        create: {
          code: String(code),
          name: String(name),
          category: String(category),
          type: String(type),
          priority: priority as any,
          slaHours: Number(slaHours),
          teamId: String(teamId),
          description: String(description),
        },
      }),
    ),
  );

  const site = await prisma.site.upsert({
    where: { id: "site-riyadh-kafd" },
    update: {},
    create: {
      id: "site-riyadh-kafd",
      name: "King Abdullah Financial District",
      city: "Riyadh",
      country: "Saudi Arabia",
      type: "Mixed Use",
      areaSqm: 284000,
    },
  });

  const towerA = await prisma.building.upsert({
    where: { code: "KAFD-A" },
    update: {},
    create: { name: "Tower A", code: "KAFD-A", siteId: site.id, floors: 42, areaSqm: 92000 },
  });
  const housingSite = await prisma.site.upsert({
    where: { id: "site-jazan-camp" },
    update: {},
    create: {
      id: "site-jazan-camp",
      name: "Jazan Operations Camp",
      city: "Jazan",
      country: "Saudi Arabia",
      type: "Housing / Industrial Support",
      areaSqm: 86000,
    },
  });
  const housingAssetBuilding = await prisma.building.upsert({
    where: { code: "HSG-A" },
    update: {},
    create: { name: "Housing Block A", code: "HSG-A", siteId: housingSite.id, floors: 3, areaSqm: 8200 },
  });

  await Promise.all(
    [
      ["Main Lobby", "G", "Reception", 280, 1200, 190],
      ["Executive Offices", "18", "Office", 420, 3100, 336],
      ["Basement Plant Room", "B2", "Plant", 35, 2400, 12],
      ["Housing Room A101", "1", "Accommodation", 1, 32, 1],
      ["Housing Room A102", "1", "Accommodation", 2, 42, 1],
    ].map(([name, floor, type, capacity, areaSqm, occupancy]) =>
      prisma.space.upsert({
        where: { id: `space-${String(name).toLowerCase().replaceAll(" ", "-")}` },
        update: {},
        create: {
          id: `space-${String(name).toLowerCase().replaceAll(" ", "-")}`,
          name: String(name),
          floor: String(floor),
          type: String(type),
          capacity: Number(capacity),
          areaSqm: Number(areaSqm),
          occupancy: Number(occupancy),
          buildingId: String(name).startsWith("Housing") ? housingAssetBuilding.id : towerA.id,
        },
      }),
    ),
  );

  const assetRows = [
    ["AHU-RYD-01-004", "Air Handling Unit 4", "HVAC", "Cooling", "HIGH", "ACTIVE", 88, 145000, "MEP", "mariam@brightworks.local", "18", "Plant Room"],
    ["GEN-RYD-02-001", "Emergency Generator 1", "ELEC", "Electrical", "CRITICAL", "STANDBY", 91, 420000, "ELEC", "mariam@brightworks.local", "B2", "Generator Room"],
    ["FLS-RYD-01-221", "Fire Pump Controller", "FLS", "Fire", "CRITICAL", "ACTIVE", 76, 88000, "MEP", "sara@brightworks.local", "B2", "Fire Pump Room"],
    ["CHL-RYD-01-002", "Centrifugal Chiller 2", "HVAC", "Cooling", "CRITICAL", "ACTIVE", 72, 980000, "MEP", "mariam@brightworks.local", "B2", "Chiller Plant"],
    ["LFT-RYD-A-008", "Passenger Lift 8", "ELEC", "Elevators", "HIGH", "ACTIVE", 83, 360000, "ELEC", "mariam@brightworks.local", "G", "Lift Lobby"],
    ["FUR-RYD-18-044", "Executive Desk 44", "FURN", "Furniture", "LOW", "ACTIVE", 95, 9500, "CIVIL", "omar@brightworks.local", "18", "Executive Offices"],
    ["IT-RYD-18-AP12", "Wireless Access Point 12", "IT", "Network", "MEDIUM", "ACTIVE", 89, 2800, "ELEC", "mariam@brightworks.local", "18", "Executive Offices"],
    ["HSG-A101-AC01", "Housing Room A101 Split AC", "HSG", "Housing HVAC", "MEDIUM", "ACTIVE", 81, 6800, "HSG", "lina@brightworks.local", "1", "A101"],
    ["WTR-RYD-RO-001", "Potable Water Booster Pump", "PLUMB", "Water Hygiene", "HIGH", "ACTIVE", 79, 52000, "MEP", "mariam@brightworks.local", "Roof", "Water Tank Room"],
  ] as const;

  const assets = await Promise.all(
    assetRows.map(([tag, name, category, system, criticality, status, conditionScore, purchaseCost, assignedTeamCode, assignedSupervisorEmail, floor, room]) =>
      prisma.asset.upsert({
        where: { tag },
        update: {},
        create: {
          tag,
          name,
          category,
          system,
          criticality,
          status,
          serialNumber: `${tag}-SN`,
          siteCode: tag.startsWith("HSG") ? "JAZAN-CAMP" : "169",
          zone: tag.startsWith("HSG") ? "Housing" : "CB",
          buildingCode: tag.startsWith("HSG") ? "HSG-A" : "CB04",
          assetGroup: tag.includes("AHU") ? "AHU" : category,
          assetDescription: name,
          additionalDescription: system,
          parentAsset: "TOP LEVEL",
          departmentCode: assignedTeamCode,
          assignedTeamCode,
          assignedSupervisorEmail,
          remarks: "Seeded from CAFM baseline.",
          conditionScore,
          manufacturer: "Enterprise OEM",
          model: "X-Series",
          installDate: subDays(new Date(), 1200),
          replacementDate: addDays(new Date(), 2200),
          warrantyExpiry: addDays(new Date(), 545),
          contractRef: "Integrated Hard Services Contract",
          documentationUrl: "https://example.com/asset-manual.pdf",
          purchaseCost,
          salvageValue: Math.round(purchaseCost * 0.1),
          depreciationRate: 12.5,
          floor,
          room,
          qrCode: `CAFM-ASSET:${tag}`,
          siteId: tag.startsWith("HSG") ? housingSite.id : site.id,
          buildingId: tag.startsWith("HSG") ? housingAssetBuilding.id : towerA.id,
        },
      }),
    ),
  );

  await Promise.all(
    assets.map((asset) =>
      prisma.assetHistory.upsert({
        where: { id: `hist-${asset.tag}` },
        update: {},
        create: {
          id: `hist-${asset.tag}`,
          assetId: asset.id,
          eventType: "COMMISSIONED",
          title: "Asset commissioned",
          details: `${asset.tag} registered with baseline condition score ${asset.conditionScore}.`,
          actor: "System",
        },
      }),
    ),
  );

  await Promise.all(
    ([
      ["SR-24001", "Lobby temperature above comfort range", "HVAC", "MEP", "HVAC-REQ", "MEP", "mariam@brightworks.local", "Tenant Services", "HIGH", "ASSIGNED", "Tower A > G > Main Lobby", 12],
      ["SR-24002", "Water leak near pantry", "Plumbing", "MEP", "PLUMB-REQ", "MEP", "mariam@brightworks.local", "Floor Warden", "CRITICAL", "IN_PROGRESS", "Tower A > 18 > Pantry", 4],
      ["SR-24003", "Access card reader intermittent", "Security", "SEC", "SEC-REQ", "ELEC", "mariam@brightworks.local", "Reception", "MEDIUM", "NEW", "Tower A > G > Main Lobby", 48],
      ["SR-24004", "Ceiling tile damaged in office", "Civil", "CIVIL", "CIVIL-REQ", "CIVIL", "omar@brightworks.local", "Admin Office", "LOW", "APPROVED", "Tower A > 18 > Executive Offices", 36],
      ["SR-24005", "Washroom cleaning required", "Housekeeping", "HK", "HK-REQ", "HK", "omar@brightworks.local", "Resident", "MEDIUM", "NEW", "Tower A > 18 > Pantry", 8],
      ["SR-24006", "Housing room A101 AC not cooling", "Housing Maintenance", "HOUSING", "HOUSING-MAINT", "HSG", "lina@brightworks.local", "Hamayun Ali", "HIGH", "PENDING_ASSIGNMENT", "Reserve Housing Village / Block A / 1 / A101", 6],
    ] as const).map(([ticketNo, title, category, departmentCode, serviceCode, assignedTeamCode, assignedSupervisorEmail, requester, priority, status, location, slaHours]) =>
      prisma.serviceRequest.upsert({
        where: { ticketNo },
        update: {},
        create: {
          ticketNo,
          title,
          category,
          departmentCode,
          serviceCode,
          assignedTeamCode,
          assignedSupervisorEmail,
          requester,
          channel: "Portal",
          priority,
          status,
          location,
          slaHours: Number(slaHours),
          dueAt: addHoursSafe(Number(slaHours)),
          description: `${title} reported from ${location}.`,
        },
      }),
    ),
  );

  await Promise.all(
    [
      { woNo: "WO-81024", title: "Replace AHU filters and rebalance", type: "PPM", priority: "HIGH" as const, status: "IN_PROGRESS" as const, assetId: assets[0].id, departmentCode: "MEP", serviceCode: "HVAC-REQ", assignedTeamCode: "MEP", jobPlanCode: "JP-HVAC-FILTER", assignedToId: userByEmail["adeel@brightworks.local"]?.id ?? admin.id, cost: 2200, inventoryUsed: "FLT-24X24-MERV13:2", workNotes: "Technician responded and AHU isolation is complete." },
      { woNo: "WO-81025", title: "Fire pump weekly test", type: "Inspection", priority: "CRITICAL" as const, status: "ASSIGNED" as const, assetId: assets[2].id, departmentCode: "MEP", serviceCode: "PLUMB-REQ", assignedTeamCode: "MEP", jobPlanCode: "JP-FLS-PUMP", assignedToId: userByEmail["sara@brightworks.local"]?.id ?? admin.id, cost: 780, inventoryUsed: "", workNotes: "" },
      { woNo: "WO-81026", title: "Chiller vibration investigation", type: "Condition Based", priority: "HIGH" as const, status: "TRIAGED" as const, assetId: assets[3].id, departmentCode: "MEP", serviceCode: "HVAC-REQ", assignedTeamCode: "MEP", jobPlanCode: "JP-CHILLER-CB", assignedToId: userByEmail["adeel@brightworks.local"]?.id ?? admin.id, cost: 0, inventoryUsed: "", workNotes: "" },
      { woNo: "WO-81027", title: "Replace failed LED panel", type: "Corrective", priority: "MEDIUM" as const, status: "PENDING_SUPERVISOR_REVIEW" as const, assetId: assets[6].id, departmentCode: "ELEC", serviceCode: "ELEC-REQ", assignedTeamCode: "ELEC", jobPlanCode: "JP-ELEC-LIGHT", assignedToId: userByEmail["adeel@brightworks.local"]?.id ?? admin.id, cost: 320, inventoryUsed: "LED-PNL-60W:1", workNotes: "Panel replaced and tested. Awaiting supervisor closure." },
      { woNo: "WO-81028", title: "Repair executive office desk drawer", type: "Corrective", priority: "LOW" as const, status: "CLOSED" as const, assetId: assets[5].id, departmentCode: "CIVIL", serviceCode: "CIVIL-REQ", assignedTeamCode: "CIVIL", jobPlanCode: "JP-CIVIL-FIX", assignedToId: userByEmail["omar@brightworks.local"]?.id ?? admin.id, cost: 140, inventoryUsed: "", workNotes: "Drawer rails adjusted and work verified." },
      { woNo: "WO-81029", title: "Restore cooling in housing room A101", type: "Housing Maintenance", priority: "HIGH" as const, status: "OPEN" as const, assetId: assets[7].id, departmentCode: "HOUSING", serviceCode: "HOUSING-MAINT", assignedTeamCode: "HSG", jobPlanCode: "JP-HSG-ROOM", assignedToId: userByEmail["faisal@brightworks.local"]?.id ?? admin.id, cost: 0, inventoryUsed: "", workNotes: "Pending technician dispatch." },
    ].map((row) =>
      prisma.workOrder.upsert({
        where: { woNo: row.woNo },
        update: {},
        create: {
          woNo: row.woNo,
          title: row.title,
          type: row.type,
          priority: row.priority,
          status: row.status,
          assetId: row.assetId,
          departmentCode: row.departmentCode,
          serviceCode: row.serviceCode,
          assignedTeamCode: row.assignedTeamCode,
          jobPlanCode: row.jobPlanCode,
          assignedToId: row.assignedToId,
          plannedStart: new Date(),
          dueAt: addDays(new Date(), 2),
          estimatedHours: 4,
          actualHours: row.status === "IN_PROGRESS" ? 1.5 : null,
          cost: row.cost,
          responseAt: ["IN_PROGRESS", "PENDING_SUPERVISOR_REVIEW", "CLOSED"].includes(row.status) ? subDays(new Date(), 1) : null,
          resolutionAt: ["PENDING_SUPERVISOR_REVIEW", "CLOSED"].includes(row.status) ? new Date() : null,
          finishedAt: row.status === "CLOSED" ? new Date() : null,
          inventoryUsed: row.inventoryUsed,
          workNotes: row.workNotes,
          jobPlan: "Inspect, isolate if required, execute checklist, capture readings, update failure codes and attach photos.",
          safetyNotes: "Verify PTW, PPE, access clearance and isolation requirements.",
        },
      }),
    ),
  );

  await Promise.all(
    [
      ["PM-HVAC-001", "Monthly AHU Service", "AHU-RYD-01-004", "Monthly", "Check belts, filters, coils, dampers and vibration."],
      ["PM-FLS-010", "Weekly Fire Pump Test", "FLS-RYD-01-221", "Weekly", "Run pump, verify pressures, alarms, valves and controller logs."],
      ["PM-GEN-003", "Generator Load Run", "GEN-RYD-02-001", "Monthly", "Inspect fuel, batteries, coolant, ATS and run under load."],
      ["PM-LIFT-008", "Lift Safety Inspection", "LFT-RYD-A-008", "Quarterly", "Check door operation, emergency phone, ride quality and rescue kit."],
      ["PM-HSG-AC101", "Housing AC Preventive Service", "HSG-A101-AC01", "Monthly", "Clean filters, check drain, verify cooling and resident acceptance."],
      ["PM-WTR-001", "Potable Water Booster Check", "WTR-RYD-RO-001", "Monthly", "Verify pump operation, tank hygiene log, pressure readings and water sample date."],
    ].map(([code, name, assetTag, frequency, checklist]) =>
      prisma.preventiveMaintenance.upsert({
        where: { code },
        update: {},
        create: { code, name, assetTag, frequency, nextDue: addDays(new Date(), 7), durationHrs: 2, checklist },
      }),
    ),
  );

  await Promise.all(
    [
      ["KAFD-A-G-LOBBY", "King Abdullah Financial District", "CB", "Tower A", "G", "Main Lobby", "Public", "Main reception and visitor lobby."],
      ["KAFD-A-18-PLANT", "King Abdullah Financial District", "CB", "Tower A", "18", "Plant Room", "Plant", "Primary MEP plant room for Tower A level 18."],
      ["KAFD-A-18-OFFICE", "King Abdullah Financial District", "CB", "Tower A", "18", "Executive Offices", "Office", "Executive office suite and meeting rooms."],
      ["KAFD-A-B2-GEN", "King Abdullah Financial District", "CB", "Tower A", "B2", "Generator Room", "Plant", "Emergency generator room."],
      ["KAFD-A-B2-FIRE", "King Abdullah Financial District", "CB", "Tower A", "B2", "Fire Pump Room", "Life Safety", "Fire pump and controller room."],
      ["KAFD-A-B2-CHILLER", "King Abdullah Financial District", "CB", "Tower A", "B2", "Chiller Plant", "Plant", "Chiller and chilled water plant space."],
      ["KAFD-A-G-LIFT", "King Abdullah Financial District", "CB", "Tower A", "G", "Lift Lobby", "Vertical Transport", "Passenger lift lobby."],
      ["KAFD-A-18-PANTRY", "King Abdullah Financial District", "CB", "Tower A", "18", "Pantry", "Support", "Floor pantry and small wet area."],
      ["KAFD-A-ROOF-WATER", "King Abdullah Financial District", "CB", "Tower A", "Roof", "Water Tank Room", "Water Hygiene", "Potable water booster pump and tank room."],
      ["HSP-A-1-A101", "Jazan Operations Camp", "Housing", "Block A", "1", "A101", "Accommodation", "Single executive accommodation room."],
      ["HSP-A-1-A102", "Jazan Operations Camp", "Housing", "Block A", "1", "A102", "Accommodation", "Shared technician accommodation room."],
      ["HSP-A-2-A202", "Jazan Operations Camp", "Housing", "Block A", "2", "A202", "Maintenance", "Room blocked for bathroom repair."],
    ].map(([code, siteName, zone, building, floor, room, type, description]) =>
      prisma.location.upsert({
        where: { code: String(code) },
        update: {},
        create: {
          code: String(code),
          site: String(siteName),
          zone: String(zone),
          building: String(building),
          floor: String(floor),
          room: String(room),
          type: String(type),
          description: String(description),
        },
      }),
    ),
  );

  await Promise.all(
    [
      ["JP-HVAC-FILTER", "AHU Filter Replacement", "HVAC", "MEP", "HVAC-REQ", 2, "MEDIUM", "Inspect filter bank, isolate AHU if required, replace filters, clean frame, verify differential pressure and update asset history.", "Use PPE, check access permit and verify safe access before removing filters."],
      ["JP-FLS-PUMP", "Fire Pump Weekly Test", "FLS", "MEP", "PLUMB-REQ", 1.5, "CRITICAL", "Check controller, run pump, record suction/discharge pressure, verify jockey pump and alarms.", "Notify control room before test and follow fire system bypass process."],
      ["JP-CHILLER-CB", "Chiller Condition Investigation", "HVAC", "MEP", "HVAC-REQ", 4, "HIGH", "Review BMS trend, inspect vibration, check oil and temperatures, record corrective recommendation.", "Use hearing protection and follow rotating equipment precautions."],
      ["JP-ELEC-LIGHT", "Lighting Panel Replacement", "ELEC", "ELEC", "ELEC-REQ", 1, "MEDIUM", "Isolate circuit, replace panel/light fitting, test lux level and restore circuit.", "Lockout/tagout the circuit and verify dead before touching wiring."],
      ["JP-CIVIL-FIX", "Civil Minor Repair", "FURN", "CIVIL", "CIVIL-REQ", 2, "LOW", "Inspect defect, repair/replace fixture, clean area and confirm user acceptance.", "Use hand tools safely and protect surrounding finishes."],
      ["JP-HSG-ROOM", "Housing Room Corrective Visit", "HSG", "HOUSING", "HOUSING-MAINT", 3, "HIGH", "Inspect room asset, log condition, restore service, verify resident acceptance and update housing history.", "Respect occupancy protocol and isolate equipment safely before opening covers."],
    ].map(([code, name, assetType, departmentCode, serviceCode, estimatedHours, priority, steps, safetyNotes]) =>
      prisma.jobPlan.upsert({
        where: { code: String(code) },
        update: {},
        create: {
          code: String(code),
          name: String(name),
          assetType: String(assetType),
          departmentCode: String(departmentCode),
          serviceCode: String(serviceCode),
          estimatedHours: Number(estimatedHours),
          priority: priority as any,
          steps: String(steps),
          safetyNotes: String(safetyNotes),
        },
      }),
    ),
  );

  const inventory = [
    ["FLT-24X24-MERV13", "MERV 13 Filter", "HVAC", "pcs", 34, 50, 45, "Gulf MEP Supplies"],
    ["LED-PNL-60W", "LED Panel 60W", "Electrical", "pcs", 122, 80, 32, "BrightLine Trading"],
    ["VLV-BALL-2IN", "2 inch Ball Valve", "Plumbing", "pcs", 18, 30, 79, "AquaTech Parts"],
    ["BAT-UPS-12V", "UPS Battery 12V", "Electrical", "pcs", 12, 16, 210, "PowerSafe Trading"],
    ["DR-HINGE-SS", "Stainless Door Hinge", "Civil", "set", 7, 20, 28, "BuildRight Supplies"],
    ["AC-FILTER-SPLIT", "Split AC Washable Filter", "Housing", "pcs", 9, 12, 36, "CoolAir Parts"],
  ] as const;

  await Promise.all(
    inventory.map(([sku, name, category, unit, onHand, reorderPoint, unitCost, vendor]) =>
      prisma.inventoryItem.upsert({
        where: { sku },
        update: {},
        create: { sku, name, category, unit, onHand, reorderPoint, unitCost, vendor, location: "Central Store A" },
      }),
    ),
  );

  const seededIssues = [
    ["FLT-24X24-MERV13", "WO-81024", 2],
    ["LED-PNL-60W", "WO-81027", 1],
    ["AC-FILTER-SPLIT", "WO-81029", 1],
  ] as const;
  for (const [sku, woNo, quantity] of seededIssues) {
    const [item, work] = await Promise.all([
      prisma.inventoryItem.findUnique({ where: { sku } }),
      prisma.workOrder.findUnique({ where: { woNo } }),
    ]);
    if (item && work) {
      await prisma.inventoryIssue.create({ data: { itemId: item.id, workId: work.id, quantity } });
      await prisma.inventoryItem.update({ where: { id: item.id }, data: { onHand: Math.max(0, item.onHand - quantity) } });
    }
  }

  const vendor = await prisma.vendor.upsert({
    where: { id: "vendor-gulf-mep" },
    update: {},
    create: {
      id: "vendor-gulf-mep",
      name: "Gulf MEP Services",
      category: "Hard Services",
      rating: 4.7,
      contact: "Nadia Rahman",
      email: "contracts@gulfmep.local",
      phone: "+966 11 555 0199",
    },
  });

  await prisma.contract.upsert({
    where: { id: "contract-hard-services" },
    update: {},
    create: {
      id: "contract-hard-services",
      title: "Integrated Hard Services Contract",
      vendorId: vendor.id,
      type: "FM Maintenance",
      startDate: subDays(new Date(), 180),
      endDate: addDays(new Date(), 545),
      value: 6800000,
      slaTarget: "95% monthly SLA compliance",
    },
  });

  await Promise.all(
    ([
      ["INS-FLS-144", "Fire life safety weekly audit", "All Towers", "Sara Malik", "HIGH", 91, "COMPLETED", "Minor signage issue in stairwell 3."],
      ["INS-HSE-033", "Contractor permit compliance", "Basement Plant", "Mariam Al-Fahad", "MODERATE", 84, "IN_PROGRESS", "Two permits pending supervisor closure."],
      ["INS-HK-050", "Public washroom housekeeping audit", "Tower A Level 18", "Omar Siddiqui", "LOW", 88, "OPEN", "Verify consumables and odor control."],
      ["INS-HSG-012", "Housing room readiness audit", "Reserve Housing Village", "Lina Haddad", "MODERATE", 79, "OPEN", "Room A202 remains blocked until bathroom repair is complete."],
    ] as const).map(([code, title, area, inspector, risk, score, status, findings]) =>
      prisma.inspection.upsert({
        where: { code },
        update: {},
        create: { code, title, area, inspector, risk, score: Number(score), status, dueAt: addDays(new Date(), 1), findings },
      }),
    ),
  );

  await Promise.all(
    ([
      ["CERT-FLS-2026-001", "Fire Alarm Civil Defense Certificate", "Civil Defense", "Life Safety", "FLS-RYD-01-221", "Tower A", "HSE Manager", -320, 45, "ACTIVE", "HIGH", 30, "Annual Civil Defense certificate with renewal required before expiry."],
      ["CERT-LIFT-2026-004", "Elevator Third Party Inspection", "TUV", "Vertical Transport", "LFT-RYD-A-008", "Tower A", "Facilities Supervisor", -90, 12, "EXPIRING_SOON", "MODERATE", 30, "Third-party inspection due for renewal this month."],
      ["CERT-GEN-2026-002", "Emergency Generator Load Test Certificate", "Authorized Testing Body", "Electrical", "GEN-RYD-02-001", "Generator Room", "Electrical Supervisor", -180, 120, "ACTIVE", "HIGH", 45, "Quarterly generator load bank certificate and evidence file."],
      ["CERT-WTR-2026-007", "Potable Water Tank Cleaning Certificate", "Approved Lab", "Water Hygiene", "WTR-RYD-RO-001", "Tower A Roof", "MEP Supervisor", -370, -5, "EXPIRED", "EXTREME", 30, "Immediate renewal required before next audit."],
      ["CERT-HSG-2026-003", "Housing Fire Extinguisher Inspection", "Civil Defense", "Accommodation Safety", "HSA-EXT-A101", "Reserve Housing Village", "Housing Supervisor", -80, 75, "ACTIVE", "MODERATE", 30, "Housing block extinguisher inspection record."],
    ] as const).map(([certificateNo, title, authority, category, assetTag, location, owner, issueOffset, expiryOffset, status, risk, renewalLeadDays, notes]) =>
      prisma.complianceCertificate.upsert({
        where: { certificateNo },
        update: { title, authority, category, assetTag, location, owner, issueDate: addDays(new Date(), Number(issueOffset)), expiryDate: addDays(new Date(), Number(expiryOffset)), status, risk, renewalLeadDays: Number(renewalLeadDays), notes },
        create: { certificateNo, title, authority, category, assetTag, location, owner, issueDate: addDays(new Date(), Number(issueOffset)), expiryDate: addDays(new Date(), Number(expiryOffset)), status, risk, renewalLeadDays: Number(renewalLeadDays), evidenceUrl: "", notes },
      }),
    ),
  );

  await prisma.hseIncident.upsert({
    where: { refNo: "HSE-2026-001" },
    update: {},
    create: {
      refNo: "HSE-2026-001",
      title: "Minor slip near loading bay",
      area: "Loading Bay",
      severity: "MODERATE",
      status: "TRIAGED",
      correctiveAction: "Improve floor drying procedure and add temporary warning signage.",
    },
  });

  await prisma.iotAlert.deleteMany({});
  await prisma.meter.deleteMany({});

  await Promise.all(
    ([
      ["BMS", "CHL-RYD-01-002", "HIGH", "Chiller vibration exceeds baseline by 18%", "TRIAGED"],
      ["Energy Meter", "MDB-RYD-03-001", "MEDIUM", "Peak demand forecast breach in 48 hours", "NEW"],
      ["Room Sensor", "HSG-A101-AC01", "HIGH", "Housing room A101 temperature above setpoint for 3 hours", "NEW"],
      ["Water Sensor", "WTR-RYD-RO-001", "MEDIUM", "Potable water pump runtime exceeds monthly average", "TRIAGED"],
    ] as const).map(([source, assetTag, severity, message, status]) =>
      prisma.iotAlert.create({
        data: { source, assetTag, severity, message, status },
      }),
    ),
  );

  await Promise.all(
    assets.slice(0, 3).map((asset, index) =>
      prisma.meter.create({
        data: {
          name: `${asset.tag} runtime`,
          type: "Runtime",
          unit: "hrs",
          reading: 1200 + index * 240,
          assetId: asset.id,
        },
      }),
    ),
  );

  const housingProperty = await prisma.housingProperty.upsert({
    where: { code: "HSP-001" },
    update: {
      name: "Reserve Housing Village",
      site: "Jazan Operations Camp",
      city: "Jazan",
      manager: "Housing Supervisor",
      totalRooms: 6,
    },
    create: {
      code: "HSP-001",
      name: "Reserve Housing Village",
      site: "Jazan Operations Camp",
      city: "Jazan",
      manager: "Housing Supervisor",
      totalRooms: 6,
    },
  });
  const housingBlock = await prisma.housingBlock.upsert({
    where: { code: "HSB-A" },
    update: {},
    create: { code: "HSB-A", name: "Block A", propertyId: housingProperty.id, floors: 3 },
  });

  const housingRooms = [] as Awaited<ReturnType<typeof prisma.housingRoom.upsert>>[];
  for (const [code, roomNumber, floor, roomType, capacity, occupancy, status] of [
    ["HSR-A101", "A101", "1", "Single Executive", 1, 1, "OCCUPIED"],
    ["HSR-A102", "A102", "1", "Shared Technician", 2, 1, "RESERVED"],
    ["HSR-A201", "A201", "2", "Shared Technician", 2, 0, "AVAILABLE"],
    ["HSR-A202", "A202", "2", "Isolation / Maintenance", 1, 0, "MAINTENANCE"],
    ["HSR-B101", "B101", "1", "Female Staff", 2, 2, "OCCUPIED"],
    ["HSR-R101", "R101", "1", "Visitor", 1, 0, "BLOCKED"],
  ] as const) {
    const room = await prisma.housingRoom.upsert({
      where: { code },
      update: {},
      create: {
        code,
        roomNumber,
        propertyId: housingProperty.id,
        blockId: housingBlock.id,
        floor,
        roomType,
        capacity,
        occupancy,
        status,
        qrCode: `QR:${code}`,
        remarks: `${roomType} room for CAFM housing operation testing.`,
      },
    });
    housingRooms.push(room);
    for (let index = 1; index <= capacity; index += 1) {
      await prisma.housingBed.upsert({
        where: { code: `${code}-B${index}` },
        update: {},
        create: {
          code: `${code}-B${index}`,
          label: `Bed ${index}`,
          roomId: room.id,
          status: index <= occupancy ? (status === "OCCUPIED" ? "OCCUPIED" : "RESERVED") : "AVAILABLE",
          occupant: index <= occupancy ? (index === 1 ? "Hamayun Ali" : "Resident") : "",
        },
      });
    }
  }

  const resident = await prisma.housingResident.upsert({
    where: { residentNo: "RES-00001" },
    update: {
      email: "hamayun.resident@reserve.local",
      companyId: "RES-EMP-001",
      companyName: "Reserve Operations",
      gender: "Male",
    },
    create: {
      residentNo: "RES-00001",
      name: "Hamayun Ali",
      email: "hamayun.resident@reserve.local",
      phone: "+966 500000101",
      companyId: "RES-EMP-001",
      companyName: "Reserve Operations",
      gender: "Male",
      nationality: "Pakistan",
      departmentCode: "MEP",
    },
  });
  const additionalResidents = await Promise.all(
    [
      ["RES-00002", "Bilal Ahmed", "bilal.resident@reserve.local", "+966 500000102", "RES-EMP-002", "Reserve Operations", "Male", "Pakistan", "HOUSING"],
      ["RES-00003", "Nadia Khan", "nadia.resident@reserve.local", "+966 500000103", "RES-EMP-003", "Reserve Catering", "Female", "India", "HK"],
      ["RES-00004", "Priya Menon", "priya.resident@reserve.local", "+966 500000104", "RES-EMP-004", "Reserve Catering", "Female", "India", "HK"],
    ].map(([residentNo, name, email, phone, companyId, companyName, gender, nationality, departmentCode]) =>
      prisma.housingResident.upsert({
        where: { residentNo },
        update: { email, phone, companyId, companyName, gender, nationality, departmentCode },
        create: { residentNo, name, email, phone, companyId, companyName, gender, nationality, departmentCode },
      }),
    ),
  );
  const bed = await prisma.housingBed.findFirst({ where: { roomId: housingRooms[0].id } });
  const booking = await prisma.housingBooking.upsert({
    where: { bookingNo: "HBK-00001" },
    update: {},
    create: {
      bookingNo: "HBK-00001",
      residentId: resident.id,
      residentName: resident.name,
      departmentCode: "MEP",
      employeeId: resident.residentNo,
      companyName: resident.companyName,
      nationality: resident.nationality,
      contactNumber: resident.phone,
      gender: resident.gender,
      buildingNumber: "Block A",
      floorNumber: "1",
      roomNumber: "A101",
      bedNumber: "Bed 1",
      roomId: housingRooms[0].id,
      bedId: bed?.id,
      checkIn: subDays(new Date(), 2),
      checkOut: addDays(new Date(), 28),
      status: "CHECKED_IN",
      priority: "MEDIUM",
      requestedBy: "Reception",
      approvedBy: "Housing Supervisor",
      approvalLevel: "Supervisor",
      notes: "Seed booking for end-to-end housing workflow verification.",
    },
  });
  const reservedBed = await prisma.housingBed.findFirst({ where: { roomId: housingRooms[1].id, status: "RESERVED" } });
  const occupiedSharedBed = await prisma.housingBed.findFirst({ where: { roomId: housingRooms[1].id } });
  const pendingBooking = await prisma.housingBooking.upsert({
    where: { bookingNo: "HBK-00002" },
    update: {},
    create: {
      bookingNo: "HBK-00002",
      residentId: additionalResidents[0].id,
      residentName: additionalResidents[0].name,
      departmentCode: "HOUSING",
      employeeId: additionalResidents[0].residentNo,
      companyName: additionalResidents[0].companyName,
      nationality: additionalResidents[0].nationality,
      contactNumber: additionalResidents[0].phone,
      gender: additionalResidents[0].gender,
      buildingNumber: "Block A",
      floorNumber: "1",
      roomNumber: "A102",
      bedNumber: reservedBed?.label ?? "Bed 1",
      roomId: housingRooms[1].id,
      bedId: reservedBed?.id ?? occupiedSharedBed?.id,
      checkIn: addDays(new Date(), 1),
      checkOut: addDays(new Date(), 31),
      status: "PENDING_APPROVAL",
      priority: "HIGH",
      requestedBy: "Housing Coordinator",
      approvalLevel: "Camp Manager",
      notes: "Pending approval for incoming technician.",
    },
  });
  const b101Room = housingRooms[4] ?? housingRooms[2] ?? housingRooms[0];
  const b101Bed = await prisma.housingBed.findFirst({ where: { roomId: b101Room.id } });
  const checkoutBooking = await prisma.housingBooking.upsert({
    where: { bookingNo: "HBK-00003" },
    update: {},
    create: {
      bookingNo: "HBK-00003",
      residentId: additionalResidents[1].id,
      residentName: additionalResidents[1].name,
      departmentCode: "HK",
      employeeId: additionalResidents[1].residentNo,
      companyName: additionalResidents[1].companyName,
      nationality: additionalResidents[1].nationality,
      contactNumber: additionalResidents[1].phone,
      gender: additionalResidents[1].gender,
      buildingNumber: "Block A",
      floorNumber: b101Room.floor,
      roomNumber: b101Room.roomNumber,
      bedNumber: b101Bed?.label ?? "Bed 1",
      roomId: b101Room.id,
      bedId: b101Bed?.id,
      checkIn: subDays(new Date(), 30),
      checkOut: addDays(new Date(), 2),
      status: "CHECKED_IN",
      priority: "LOW",
      requestedBy: "Reception",
      approvedBy: "Housing Supervisor",
      approvalLevel: "Supervisor",
      notes: "Upcoming check-out alert sample.",
    },
  });
  await Promise.all([
    prisma.housingApproval.create({
      data: { entity: "booking", entityId: booking.id, bookingId: booking.id, level: "Supervisor", approver: "Housing Supervisor", status: "APPROVED", action: "APPROVE", approverName: "Lina Haddad", actedAt: subDays(new Date(), 2), remarks: "Approved sample booking." },
    }),
    prisma.housingApproval.create({
      data: { entity: "booking", entityId: pendingBooking.id, bookingId: pendingBooking.id, level: "Camp Manager", step: 2, approver: "Camp Manager", status: "PENDING", remarks: "Awaiting camp manager approval." },
    }),
    prisma.housingApproval.create({
      data: { entity: "inventory", entityId: "HSI-PPE-GLOVE", level: "Store Approval", approver: "Housing Inventory Manager", status: "WAITING", remarks: "Purchase request queued for PPE gloves." },
    }),
  ]);
  await Promise.all([
    prisma.housingNotification.create({
      data: { alertType: "MAINTENANCE_DUE", channel: "SYSTEM", role: "Housing Supervisor", title: "Housing inspection due", message: "Room A102 check-in inspection is due today.", severity: "MEDIUM", recipient: "Housing Supervisor", status: "SENT", sentAt: new Date(), bookingId: pendingBooking.id },
    }),
    prisma.housingNotification.create({
      data: { alertType: "LOW_STOCK", channel: "EMAIL", role: "Housing Inventory Manager", title: "PPE stock below minimum", message: "Disposable Gloves are below minimum stock and require purchase follow-up.", severity: "HIGH", recipient: "Housing Inventory Manager", status: "SENT", sentAt: new Date() },
    }),
    prisma.housingNotification.create({
      data: { alertType: "UPCOMING_CHECKOUT", channel: "SYSTEM", role: "Reception Team", title: "Upcoming check-out", message: "Nadia Khan is scheduled to check out in 2 days.", severity: "LOW", recipient: "Reception Team", status: "QUEUED", bookingId: checkoutBooking.id },
    }),
    prisma.housingNotification.create({
      data: { alertType: "ROOM_MAINTENANCE", channel: "SYSTEM", role: "Maintenance Supervisor", title: "Room A202 repair required", message: "Bathroom repair failed follow-up inspection. Keep room out of service.", severity: "HIGH", recipient: "Maintenance Supervisor", status: "SENT", sentAt: new Date() },
    }),
  ]);
  await prisma.housingInspection.upsert({
    where: { inspectionNo: "HIN-00001" },
    update: {},
    create: {
      inspectionNo: "HIN-00001",
      roomId: housingRooms[1].id,
      inspector: "Housing Supervisor",
      inspectionType: "Check-in Readiness",
      status: "SCHEDULED",
      score: 92,
      findings: "Verify linen, HVAC thermostat and washroom fittings before occupancy.",
      dueAt: addDays(new Date(), 1),
    },
  });
  await prisma.housingInspection.upsert({
    where: { inspectionNo: "HIN-00002" },
    update: {},
    create: {
      inspectionNo: "HIN-00002",
      roomId: housingRooms[3].id,
      inspector: "Maintenance Supervisor",
      inspectionType: "Bathroom Repair Follow-up",
      status: "FAILED",
      score: 62,
      damageFound: true,
      repairRequired: true,
      estimatedRepairCost: 850,
      findings: "Shower mixer still leaking; keep room out of service.",
      dueAt: new Date(),
    },
  });
  await prisma.housingInspection.upsert({
    where: { inspectionNo: "HIN-00003" },
    update: {},
    create: {
      inspectionNo: "HIN-00003",
      roomId: b101Room.id,
      inspector: "Housekeeping Lead",
      inspectionType: "Daily Housekeeping",
      status: "PASSED",
      score: 96,
      findings: "Room clean and consumables topped up.",
      dueAt: new Date(),
      completedAt: new Date(),
    },
  });
  await prisma.housingAsset.upsert({
    where: { tag: "HSA-BED-A101" },
    update: {},
    create: {
      tag: "HSA-BED-A101",
      name: "Executive Bed Frame",
      category: "Furniture",
      roomId: housingRooms[0].id,
      status: "ACTIVE",
      serialNumber: "BED-A101-01",
      warrantyExpiry: addDays(new Date(), 365),
      qrCode: "QR:HSA-BED-A101",
    },
  });
  await Promise.all(
    [
      {
        tag: "HSA-TV-A102",
        name: "Room Television",
        category: "Electronics",
        roomId: housingRooms[1].id,
        status: "ACTIVE",
        serialNumber: "TV-A102-01",
        warrantyExpiry: addDays(new Date(), 420),
        assetValue: 1400,
        currentValue: 980,
        depreciationRate: 18,
        pmSchedule: "Quarterly function check",
        nextPmDue: addDays(new Date(), 45),
      },
      {
        tag: "HSA-CHR-A202",
        name: "Desk Chair",
        category: "Furniture",
        roomId: housingRooms[3].id,
        status: "DAMAGED",
        serialNumber: "CHR-A202-01",
        assetValue: 350,
        currentValue: 80,
        depreciationRate: 20,
        lastInspectionAt: subDays(new Date(), 1),
      },
      {
        tag: "HSA-KTL-B101",
        name: "Electric Kettle",
        category: "Appliance",
        roomId: b101Room.id,
        status: "MISSING",
        serialNumber: "KTL-B101-01",
        assetValue: 120,
        currentValue: 0,
        depreciationRate: 25,
        lastInspectionAt: subDays(new Date(), 2),
      },
    ].map((row) =>
      prisma.housingAsset.upsert({
        where: { tag: row.tag },
        update: { status: row.status, roomId: row.roomId },
        create: {
          ...row,
          qrCode: `QR:${row.tag}`,
        },
      }),
    ),
  );
  await prisma.housingInventory.upsert({
    where: { sku: "HSI-LINEN-SET" },
    update: {
      supplierName: "Reserve Housekeeping Supplies",
      supplierContact: "housing.supplies@reserve.local",
      preferredSupplier: "Reserve Housekeeping Supplies",
    },
    create: {
      sku: "HSI-LINEN-SET",
      name: "Linen Set",
      category: "Linen",
      description: "Complete bed linen issue set for resident rooms.",
      roomId: housingRooms[0].id,
      storeLocation: "Housing Store / Linen Rack A",
      onHand: 48,
      minimumStock: 25,
      reorderPoint: 20,
      unit: "Set",
      unitCost: 42,
      supplierName: "Reserve Housekeeping Supplies",
      supplierContact: "housing.supplies@reserve.local",
      preferredSupplier: "Reserve Housekeeping Supplies",
      expiryDate: addDays(new Date(), 365),
      lastMovementType: "RECEIPT",
      lastMovementQty: 48,
      lastMovementAt: new Date(),
      lastMovementBy: "System",
      purchaseRequestStatus: "NOT_REQUIRED",
      qrCode: "QR:HSI-LINEN-SET",
    },
  });
  await prisma.housingInventory.upsert({
    where: { sku: "HSI-PPE-GLOVE" },
    update: {},
    create: {
      sku: "HSI-PPE-GLOVE",
      name: "Disposable Gloves",
      category: "PPE items",
      description: "PPE gloves for housekeeping and inspection teams.",
      storeLocation: "Housing Store / PPE Shelf",
      onHand: 8,
      minimumStock: 20,
      reorderPoint: 30,
      unit: "Box",
      unitCost: 18,
      supplierName: "Safety First Trading",
      supplierContact: "+966 11 555 0201",
      preferredSupplier: "Safety First Trading",
      expiryDate: addDays(new Date(), -5),
      lastMovementType: "ISSUE",
      lastMovementQty: 4,
      lastMovementAt: new Date(),
      lastMovementBy: "Housing Supervisor",
      purchaseRequestNo: "HPR-SAMPLE-001",
      purchaseRequestStatus: "REQUESTED",
      qrCode: "QR:HSI-PPE-GLOVE",
    },
  });
  await Promise.all(
    [
      {
        sku: "HSI-CLEANER-5L",
        name: "Multi-purpose Cleaner 5L",
        category: "Cleaning materials",
        description: "Daily cleaning chemical.",
        storeLocation: "Housing Store / Chemical Cabinet",
        onHand: 18,
        minimumStock: 12,
        reorderPoint: 16,
        unit: "Can",
        unitCost: 24,
        supplierName: "CleanPro",
        supplierContact: "+966 11 555 0202",
        preferredSupplier: "CleanPro",
        expiryDate: addDays(new Date(), 180),
        lastMovementType: "ADJUSTMENT",
        lastMovementQty: 2,
        lastMovementAt: subDays(new Date(), 2),
        lastMovementBy: "Housing Storekeeper",
        purchaseRequestStatus: "NOT_REQUIRED",
      },
      {
        sku: "HSI-LAMP-LED",
        name: "Bedside LED Lamp",
        category: "Electrical spare parts",
        description: "Replacement lamp for resident rooms.",
        roomId: housingRooms[1].id,
        storeLocation: "Housing Store / Electrical Shelf",
        onHand: 5,
        minimumStock: 8,
        reorderPoint: 10,
        unit: "pcs",
        unitCost: 65,
        supplierName: "BrightLine Trading",
        supplierContact: "+966 11 555 0203",
        preferredSupplier: "BrightLine Trading",
        lastMovementType: "TRANSFER",
        lastMovementQty: 2,
        lastMovementAt: subDays(new Date(), 4),
        lastMovementBy: "Housing Technician",
        purchaseRequestNo: "HPR-SAMPLE-002",
        purchaseRequestStatus: "APPROVED",
      },
    ].map((row) =>
      prisma.housingInventory.upsert({
        where: { sku: row.sku },
        update: { onHand: row.onHand, minimumStock: row.minimumStock, reorderPoint: row.reorderPoint, purchaseRequestStatus: row.purchaseRequestStatus },
        create: {
          ...row,
          qrCode: `QR:${row.sku}`,
        },
      }),
    ),
  );
  const housingAlertSettings = [
    ["UPCOMING_CHECKOUT", "Upcoming check-out", "Housing Supervisor,Reception Team", "SYSTEM,EMAIL"],
    ["OVERSTAY_OCCUPANT", "Overstay occupants", "Housing Supervisor,Camp Manager", "SYSTEM,EMAIL,SMS"],
    ["LOW_STOCK", "Low stock inventory", "Housing Inventory Manager,Housing Supervisor", "SYSTEM,EMAIL"],
    ["PENDING_APPROVAL", "Pending approvals", "Housing Coordinator,Housing Supervisor,Camp Manager,Reception Team", "SYSTEM,EMAIL"],
    ["ROOM_MAINTENANCE", "Room maintenance", "Maintenance Supervisor,Housing Supervisor", "SYSTEM,EMAIL"],
  ] as const;
  await Promise.all(
    housingAlertSettings.map(([alertType, label, roles, channels]) =>
      prisma.housingNotificationSetting.upsert({
        where: { alertType },
        update: {},
        create: { alertType, label, roles, channels, enabled: true, description: `${label} automatic alert`, severity: "MEDIUM" },
      }),
    ),
  );
  await prisma.housingHistory.createMany({
    data: [
      { entity: "room", entityId: housingRooms[0].id, roomId: housingRooms[0].id, action: "Room seeded", actor: "System", details: "Initial room occupancy loaded." },
      { entity: "booking", entityId: booking.id, bookingId: booking.id, roomId: housingRooms[0].id, action: "Booking checked in", actor: "Housing Supervisor", details: "Resident checked in and bed allocation confirmed." },
      { entity: "booking", entityId: pendingBooking.id, bookingId: pendingBooking.id, roomId: housingRooms[1].id, action: "Approval requested", actor: "Housing Coordinator", details: "Incoming technician booking routed to camp manager." },
      { entity: "booking", entityId: checkoutBooking.id, bookingId: checkoutBooking.id, roomId: b101Room.id, action: "Upcoming checkout", actor: "System", details: "Checkout notification queued for reception." },
      { entity: "inspection", entityId: "HIN-00002", roomId: housingRooms[3].id, action: "Inspection failed", actor: "Maintenance Supervisor", details: "Bathroom repair follow-up failed and repair required." },
      { entity: "inventory", entityId: "HSI-PPE-GLOVE", action: "Low stock alert", actor: "System", details: "PPE gloves dropped below minimum stock." },
    ],
  });
  await prisma.auditLog.createMany({
    data: [
      { actorId: admin.id, actorName: admin.name, role: admin.role, action: "Seeded baseline data", entity: "System", entityId: "seed", details: "Review sample data loaded across all modules." },
      { actorId: userByEmail["mariam@brightworks.local"]?.id ?? null, actorName: "Mariam Al-Fahad", role: "Facility Director", action: "Reviewed service request", entity: "ServiceRequest", entityId: "SR-24002", details: "Critical plumbing leak moved to in-progress." },
      { actorId: userByEmail["lina@brightworks.local"]?.id ?? null, actorName: "Lina Haddad", role: "Supervisor", action: "Approved housing booking", entity: "HousingBooking", entityId: "HBK-00001", details: "Resident checked into room A101." },
      { actorId: userByEmail["adeel@brightworks.local"]?.id ?? null, actorName: "Adeel Khan", role: "Technician", action: "Updated work order", entity: "WorkOrder", entityId: "WO-81024", details: "Added filter replacement progress note." },
    ],
  });
}

function addHoursSafe(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
