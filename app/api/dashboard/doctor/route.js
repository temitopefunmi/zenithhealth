import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { executeQuery } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireRole("DOCTOR");

    const doctorEmail = session.user.email;

    // Metrics
    const metricsResult = await executeQuery(
      `
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
            WHEN priority = 'High'
            AND CAST(appointmentDate AS DATE) = CAST(GETDATE() AS DATE)
            THEN 1
            ELSE 0
          END
        ) AS highPriorityAppointments

      FROM Appointments
      WHERE doctorEmail = @doctorEmail
      `,
      {
        doctorEmail,
      }
    );

    // Recent appointments
    const appointmentsResult = await executeQuery(
      `
      SELECT TOP 10
        id,
        patientName,
        appointmentDate,
        status,
        priority,
        department,
        appointmentType,
        notes
      FROM Appointments
      WHERE doctorEmail = @doctorEmail
      ORDER BY appointmentDate ASC
      `,
      {
        doctorEmail,
      }
    );

    return NextResponse.json({
      metrics: metricsResult.recordset[0],
      appointments: appointmentsResult.recordset,
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
      { error: "Failed to load doctor dashboard" },
      { status: 500 }
    );
  }
}