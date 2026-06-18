import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const session = await requireRole("DOCTOR");

    const result = await executeQuery(
      `
      SELECT
        patientName,
        appointmentDate,
        appointmentType,
        status,
        priority
      FROM Appointments
      WHERE doctorEmail = @doctorEmail 
      AND appointmentDate >= CAST(GETDATE() AS DATE)
      AND appointmentDate < DATEADD(day,7,GETDATE())
      AND status IN ('Scheduled', 'Pending')
      ORDER BY appointmentDate ASC
      `,
      {
        doctorEmail: session.user.email,
      }
    );

    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error(err);

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

    return NextResponse.json(
      {
        error: "Failed to load appointments",
      },
      {
        status: 500,
      }
    );
  }
}