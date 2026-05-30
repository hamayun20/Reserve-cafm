import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  defaultLifeYrs: z.coerce.number().int().min(1).optional(),
  statutory: z.coerce.boolean().optional(),
  description: z.string().optional(),
});

export async function GET() {
  return NextResponse.json(await prisma.assetCategory.findMany({ orderBy: { name: "asc" } }));
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const count = await prisma.assetCategory.count();
    const code = input.code || `CAT-${String(count + 1).padStart(3, "0")}`;
    const name = input.name || "General Category";
    const created = await prisma.assetCategory.upsert({
      where: { code },
      update: { code, name, type: input.type || "General", defaultLifeYrs: input.defaultLifeYrs ?? 5, statutory: input.statutory ?? false, description: input.description || "" },
      create: { code, name, type: input.type || "General", defaultLifeYrs: input.defaultLifeYrs ?? 5, statutory: input.statutory ?? false, description: input.description || "" },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to save asset category");
  }
}
