import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workOrderKpis, workOrderMetrics } from "@/lib/work-order-analytics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const responseGreaterThan = numberParam(url, "responseGreaterThan");
  const resolutionGreaterThan = numberParam(url, "resolutionGreaterThan");
  const slaBreach = url.searchParams.get("slaBreach");
  const delayedOnly = url.searchParams.get("delayedOnly") === "true";

  const rows = await prisma.workOrder.findMany({
    include: { asset: true, assignedTo: true },
    orderBy: { createdAt: "desc" },
  });

  const metrics = rows
    .map((row) => workOrderMetrics(row))
    .filter((row) => {
      if (responseGreaterThan !== null && Number(row.response_duration_mins ?? -1) <= responseGreaterThan) return false;
      if (resolutionGreaterThan !== null && Number(row.response_to_resolution_mins ?? -1) <= resolutionGreaterThan) return false;
      if (slaBreach === "yes" && !row.sla_breached) return false;
      if (slaBreach === "no" && row.sla_breached) return false;
      if (delayedOnly && !row.delayed) return false;
      return true;
    });

  return NextResponse.json({
    filters: { responseGreaterThan, resolutionGreaterThan, slaBreach, delayedOnly },
    kpis: workOrderKpis(metrics),
    rows: metrics,
  });
}

function numberParam(url: URL, key: string) {
  const value = url.searchParams.get(key);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
