import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().optional(),
  area: z.string().optional(),
  inspector: z.string().optional(),
  risk: z.string().optional(),
  score: z.coerce.number().int().min(0).max(100).optional(),
  findings: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const count = await prisma.inspection.count();
    const created = await prisma.inspection.create({
      data: {
        ...input,
        title: input.title || `Inspection ${count + 1}`,
        area: input.area || "General",
        inspector: input.inspector || "Inspector",
        risk: ["LOW", "MODERATE", "HIGH", "EXTREME"].includes(input.risk || "") ? input.risk as any : "LOW",
        score: input.score ?? 100,
        findings: input.findings || "No findings recorded.",
        code: `INS-${String(count + 1001).padStart(5, "0")}`,
        status: (input.score ?? 100) < 80 ? "TRIAGED" : "COMPLETED",
        dueAt: addDays(new Date(), 7),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create inspection");
  }
}
