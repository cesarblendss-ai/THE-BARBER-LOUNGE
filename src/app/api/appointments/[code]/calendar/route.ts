import { NextRequest, NextResponse } from "next/server";

import { getAppointmentByCode } from "@/lib/appointments-store";
import { generateAppointmentIcs } from "@/lib/ics";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ code: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { code } = await params;
  const appointment = await getAppointmentByCode(code);
  if (!appointment) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ics = generateAppointmentIcs(appointment);
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${appointment.confirmationCode}.ics"`,
    },
  });
}
