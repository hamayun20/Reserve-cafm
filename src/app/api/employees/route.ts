import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  companyId: z.string().optional(),
  nationalityType: z.string().optional(),
  departmentCode: z.string().optional(),
  siteLocation: z.string().optional(),
});

export async function GET() {
  return NextResponse.json(await prisma.employee.findMany({ orderBy: { name: "asc" } }));
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const count = await prisma.employee.count();
    const companyId = input.companyId || `EMP-${String(count + 1).padStart(5, "0")}`;
    const data = {
      name: input.name || `Employee ${count + 1}`,
      email: input.email || `${companyId.toLowerCase()}@cafm.local`,
      companyId,
      nationalityType: input.nationalityType || "Not specified",
      departmentCode: input.departmentCode || "General",
      siteLocation: input.siteLocation || "Main Site",
    };
    const employee = await prisma.employee.upsert({
      where: { companyId },
      update: data,
      create: data,
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to save employee");
  }
}
