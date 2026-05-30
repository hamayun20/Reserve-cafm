import { NextResponse } from "next/server";

const templates: Record<string, string> = {
  assets: "Entity Name,Asset Name,Description,Location Name,Asset Type,Model No.,Manufacturer,Serial No.,Purchase Date,QR Code,Parent Asset,Assigned To,Vendors,Asset Code,Parts,URL 1,URL Label 1,URL 2,URL Label 2,Warranty Expiry Date,Life Expectancy (in months),Purchase Cost,Replacement Cost,Salvage Value\n",
  departments: "code,name,siteLocation,description\n",
  employees: "name,email,companyId,nationalityType,departmentCode,siteLocation\n",
  teams: "name,companyIdNumber,departmentCode,service,email,phone\n",
  services: "departmentName,departmentCode\n",
  inventory: "sku,name,category,unit,onHand,reorderPoint,unitCost,vendor,location\n",
  requests: "ticketNo,title,category,departmentCode,serviceCode,assignedTeamCode,requester,channel,priority,status,location,attachmentUrls,rejectionReason,slaHours,description\n",
  workOrders: "woNo,title,type,assetType,departmentCode,serviceCode,assignedTeamCode,jobPlanCode,priority,status,assetTag,dueHours,estimatedHours,cost,jobPlan,safetyNotes,workNotes,materialRequest,photoUrls,assetsUsed,inventoryUsed,supervisorDecision\n",
  locations: "code,site,zone,building,floor,room,type,description\n",
  jobPlans: "code,name,assetType,departmentCode,serviceCode,estimatedHours,priority,steps,safetyNotes\n",
  inspections: "code,title,area,inspector,risk,score,status,dueAt,findings\n",
};

export async function GET(_request: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const body = templates[type] ?? templates.assets;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${type}-template.csv"`,
    },
  });
}
