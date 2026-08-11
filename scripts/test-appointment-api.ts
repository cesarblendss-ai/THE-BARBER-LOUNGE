import { checkAvailability, createAppointmentRequest } from "../src/lib/appointments-store";

async function test() {
  const avail = await checkAvailability("Today", "2pm");
  console.log("Availability:", avail);

  const result = await createAppointmentRequest({
    service: "Kids Haircut",
    preferredDay: "Today",
    preferredTime: "2pm",
    name: "Test User",
    phone: "9255551234",
    guestCount: 3,
  });
  console.log("Create result:", result);

  const again = await checkAvailability("Today", "2pm");
  console.log("After booking (should be false):", again.available);
}

void test();
