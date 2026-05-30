import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  role: z.string().min(2),
  permissionCodes: z.array(z.string()),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const permissions = await prisma.permission.findMany({ where: { code: { in: input.permissionCodes } } });
    await prisma.rolePermission.deleteMany({ where: { role: input.role } });
    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({ role: input.role, permissionId: permission.id })),
      skipDuplicates: true,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, "Unable to update role permissions");
  }
}
