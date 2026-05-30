type TimeInput = string | Date | null | undefined;

export type WorkOrderMetricRow = Record<string, string | number | boolean | null>;

function timeMs(value: TimeInput) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function durationMinutes(start: TimeInput, end: TimeInput) {
  const startMs = timeMs(start);
  const endMs = timeMs(end);
  if (startMs === null || endMs === null || endMs < startMs) return null;
  return Math.round((endMs - startMs) / 60000);
}

export function minutesToHms(minutes: number | null) {
  if (minutes === null) return null;
  const seconds = minutes * 60;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((part) => String(part).padStart(2, "0")).join(":");
}

export function timingStatus(value: TimeInput, label: string) {
  return value ? new Date(value).toISOString() : label;
}

export function workOrderMetrics(row: any): WorkOrderMetricRow {
  const responseMins = durationMinutes(row.createdAt, row.responseAt);
  const responseToResolutionMins = durationMinutes(row.responseAt, row.resolutionAt);
  const resolutionToFinishMins = durationMinutes(row.resolutionAt, row.finishedAt);
  const totalResponseToFinishMins = durationMinutes(row.responseAt, row.finishedAt);
  const dueMs = timeMs(row.dueAt);
  const finishOrNow = timeMs(row.finishedAt) ?? Date.now();
  const slaBreached = dueMs !== null && finishOrNow > dueMs && row.status !== "CLOSED";

  return {
    wo_id: row.woNo,
    asset: row.asset?.tag ?? row.assetTag ?? "",
    location: [row.asset?.floor, row.asset?.room].filter(Boolean).join(" / ") || row.location || "",
    service_type: row.type,
    status: row.status,
    created_time: row.createdAt ? new Date(row.createdAt).toISOString() : "",
    response_time: responseMins === null ? "Not Responded" : minutesToHms(responseMins),
    resolution_time: responseToResolutionMins === null ? "In Progress" : minutesToHms(responseToResolutionMins),
    finish_time: resolutionToFinishMins === null ? "Not Closed" : minutesToHms(resolutionToFinishMins),
    response_to_resolution_mins: responseToResolutionMins,
    resolution_to_finish_mins: resolutionToFinishMins,
    total_response_to_finish_mins: totalResponseToFinishMins,
    response_duration_mins: responseMins,
    assigned_team: row.assignedTeamCode ?? "",
    assigned_to: row.assignedTo?.name ?? "",
    sla_breached: slaBreached,
    delayed: slaBreached || responseMins === null || responseToResolutionMins === null || resolutionToFinishMins === null,
  };
}

function average(values: Array<number | null>) {
  const valid = values.filter((value): value is number => typeof value === "number");
  if (!valid.length) return null;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

export function workOrderKpis(rows: WorkOrderMetricRow[]) {
  return {
    average_response_time: minutesToHms(average(rows.map((row) => row.response_duration_mins as number | null))),
    average_resolution_time: minutesToHms(average(rows.map((row) => row.response_to_resolution_mins as number | null))),
    average_completion_time: minutesToHms(average(rows.map((row) => row.total_response_to_finish_mins as number | null))),
    total_closed_work_orders: rows.filter((row) => row.status === "CLOSED").length,
    sla_breached_count: rows.filter((row) => row.sla_breached).length,
  };
}
