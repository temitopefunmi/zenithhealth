import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET() {
  try {
    const highPriority = await executeQuery(`
      SELECT COUNT(*) AS count
      FROM Appointments
      WHERE priority = 'High'
      AND CAST(appointmentDate AS DATE) = CAST(GETDATE() AS DATE)
    `);

    const pending = await executeQuery(`
      SELECT COUNT(*) AS count
      FROM Appointments
      WHERE status = 'Pending'
    `);

    const emergency = await executeQuery(`
      SELECT COUNT(*) AS count
      FROM Appointments
      WHERE patientCategory = 'Emergency'
      AND status IN ('Pending', 'Scheduled')
      AND CAST(appointmentDate AS DATE) = CAST(GETDATE() AS DATE)
    `);

    return NextResponse.json([
      {
        id: 1,
        type: "warning",
        title: "Pending Reviews",
        message: `${pending.recordset[0].count} appointments awaiting review`
      },
      {
        id: 2,
        type: "info",
        title: "Emergency Cases",
        message: `${emergency.recordset[0].count} cases awaiting attention`
      }
    ]);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load alerts" },
      { status: 500 }
    );
  }
}