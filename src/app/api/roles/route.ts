import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export async function GET() {
  return NextResponse.json(await prisma.role.findMany({ orderBy: { name: "asc" } }));
}

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const role = await prisma.role.upsert({
      where: { name: input.name },
      update: { description: input.description || "" },
      create: { name: input.name, description: input.description || "", standard: false },
    });
    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to save role");
  }
}
