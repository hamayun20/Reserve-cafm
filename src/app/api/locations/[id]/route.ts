import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  code: z.string().optional(),
  site: z.string().optional(),
  zone: z.string().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const input = schema.parse(await request.json());
    const location = await prisma.location.update({
      where: { id },
      data: {
        code: input.code,
        site: input.site,
        zone: input.zone,
        building: input.building,
        floor: input.floor,
        room: input.room,
        type: input.type,
        description: input.description,
        active: input.active,
      },
    });
    return NextResponse.json(location);
  } catch (error) {
    return apiError(error, "Unable to update location");
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, "Unable to delete location");
  }
}
