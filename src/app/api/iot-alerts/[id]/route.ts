import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updated = await prisma.iotAlert.update({
      where: { id },
      data: { status: "TRIAGED" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error, "Unable to update IoT alert");
  }
}
