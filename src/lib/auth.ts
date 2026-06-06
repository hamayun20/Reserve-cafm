import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const sessionCookieName = "cafm_session";
export const demoUserId = "demo-admin";

const demoUser = {
  id: demoUserId,
  name: "System Administrator",
  email: "admin@cafm.local",
  role: "Admin",
  department: "Administration",
  team: null,
};

export async function getCurrentUser() {
  const jar = await cookies();
  const userId = jar.get(sessionCookieName)?.value;
  if (!userId) return null;
  if (!process.env.DATABASE_URL && userId === demoUserId) return demoUser;

  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, department: true, team: { select: { code: true, name: true } } },
    });
  } catch {
    return null;
  }
}
