import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().optional(),
  name: z.string().optional(),
  siteLocation: z.string().optional(),
  description: z.string().optional(),
});

export async function GET() {
  return NextResponse.json(await prisma.department.findMany({ orderBy: { code: "asc" } }));
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const count = await prisma.department.count();
    const code = input.code || `DPT-${String(count + 1).padStart(3, "0")}`;
    const name = input.name || "General Department";
    const department = await prisma.department.upsert({
      where: { code },
      update: { name, siteLocation: input.siteLocation || "Main Site", description: input.description || "" },
      create: { code, name, siteLocation: input.siteLocation || "Main Site", description: input.description || "" },
    });
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to save department");
  }
}
