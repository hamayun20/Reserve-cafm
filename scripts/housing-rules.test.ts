import assert from "node:assert/strict";
import { hasDuplicateHousingAllocation, housingRoomOccupancyStatus, isActiveHousingBooking } from "../src/lib/housing-rules";

assert.equal(isActiveHousingBooking("PENDING_APPROVAL"), true);
assert.equal(isActiveHousingBooking("CHECKED_OUT"), false);

assert.equal(
  hasDuplicateHousingAllocation([{ roomId: "room-1", bedId: "bed-1", status: "CHECKED_IN" }], "room-1", "bed-1"),
  true,
);
assert.equal(
  hasDuplicateHousingAllocation([{ roomId: "room-1", bedId: "bed-1", status: "CHECKED_OUT" }], "room-1", "bed-1"),
  false,
);
assert.equal(
  hasDuplicateHousingAllocation([{ roomId: "room-1", bedId: null, status: "APPROVED" }], "room-1", null),
  true,
);

assert.equal(housingRoomOccupancyStatus(2, 0), "AVAILABLE");
assert.equal(housingRoomOccupancyStatus(2, 1), "RESERVED");
assert.equal(housingRoomOccupancyStatus(2, 2), "OCCUPIED");
assert.equal(housingRoomOccupancyStatus(2, 0, "MAINTENANCE"), "MAINTENANCE");

console.log("Housing rules smoke tests passed.");
