import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  sku: z.string().optional(),
  name: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  onHand: z.coerce.number().int().min(0).optional(),
  reorderPoint: z.coerce.number().int().min(0).optional(),
  unitCost: z.coerce.number().min(0).optional(),
  vendor: z.string().optional(),
  location: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const count = await prisma.inventoryItem.count();
    const sku = input.sku || `SKU-${String(count + 1).padStart(5, "0")}`;
    const name = input.name || `Inventory Item ${count + 1}`;
    const created = await prisma.inventoryItem.upsert({
      where: { sku },
      update: {
        name,
        category: input.category || "General",
        unit: input.unit || "Each",
        onHand: input.onHand ?? 0,
        reorderPoint: input.reorderPoint ?? 0,
        unitCost: input.unitCost ?? 0,
        vendor: input.vendor || "Not specified",
        location: input.location || "Central Store",
      },
      create: {
        sku,
        name,
        category: input.category || "General",
        unit: input.unit || "Each",
        onHand: input.onHand ?? 0,
        reorderPoint: input.reorderPoint ?? 0,
        unitCost: input.unitCost ?? 0,
        vendor: input.vendor || "Not specified",
        location: input.location || "Central Store",
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to save inventory item");
  }
}
