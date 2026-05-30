import { NextResponse } from "next/server";
import { getOperatingData } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const data = await getOperatingData(user);
  return NextResponse.json(JSON.parse(JSON.stringify(data)));
}
