export const activeHousingBookingStatuses = ["REQUESTED", "PENDING_APPROVAL", "APPROVED", "CHECKED_IN"];

export function isActiveHousingBooking(status: string | null | undefined) {
  return activeHousingBookingStatuses.includes(String(status || ""));
}

export function hasDuplicateHousingAllocation(existingBookings: Array<{ status?: string | null; bedId?: string | null; roomId?: string | null }>, roomId: string, bedId?: string | null) {
  return existingBookings.some((booking) => {
    if (!isActiveHousingBooking(booking.status)) return false;
    if (bedId) return booking.bedId === bedId;
    return booking.roomId === roomId && !booking.bedId;
  });
}

export function housingRoomOccupancyStatus(capacity: number, occupancy: number, currentStatus?: string | null) {
  if (currentStatus === "MAINTENANCE" || currentStatus === "BLOCKED") return currentStatus;
  if (occupancy >= capacity) return "OCCUPIED";
  if (occupancy > 0) return "RESERVED";
  return "AVAILABLE";
}
