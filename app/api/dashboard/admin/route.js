import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const session = await requireRole("ADMIN");

    const result = await executeQuery(`
      SELECT
        COUNT(*) AS totalAppointments,

        SUM(
          CASE
            WHEN CAST(appointmentDate AS DATE) = CAST(GETDATE() AS DATE)
            THEN 1
            ELSE 0
          END
        ) AS appointmentsToday,

        SUM(
          CASE
            WHEN status = 'Pending'
            THEN 1
            ELSE 0
          END
        ) AS pendingAppointments,

        SUM(
          CASE
            WHEN status = 'Completed'
            AND CAST(appointmentDate AS DATE) = CAST(GETDATE() AS DATE)
            THEN 1
            ELSE 0
          END
        ) AS completedAppointments,

        SUM(
          CASE
            WHEN status = 'Cancelled'
            AND CAST(appointmentDate AS DATE) = CAST(GETDATE() AS DATE)
            THEN 1
            ELSE 0
          END
        ) AS cancelledAppointments,

        SUM(
          CASE
            WHEN priority = 'High'
            AND CAST(appointmentDate AS DATE) = CAST(GETDATE() AS DATE)
            THEN 1
            ELSE 0
          END
        ) AS highPriorityAppointments,

        SUM(
          CASE
            WHEN isVerified = 1
            THEN 1
            ELSE 0
          END
        ) AS verifiedAppointments
      FROM Appointments
    `);

    const stats = result.recordset[0];

    return NextResponse.json({
      totalAppointments: Number(stats.totalAppointments || 0),
      appointmentsToday: Number(stats.appointmentsToday || 0),
      pendingAppointments: Number(stats.pendingAppointments || 0),
      completedAppointments: Number(stats.completedAppointments || 0),
      cancelledAppointments: Number(stats.cancelledAppointments || 0),
      highPriorityAppointments: Number(stats.highPriorityAppointments || 0),
      verifiedAppointments: Number(stats.verifiedAppointments || 0)
    });
  } catch (err) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (err.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    console.error(err);

    return NextResponse.json(
      { error: "Failed to load admin dashboard" },
      { status: 500 }
    );
  }
}