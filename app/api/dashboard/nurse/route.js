import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  try {
    // Ensure only nurses can access this endpoint
    await requireRole("NURSE");

    const result = await executeQuery(`
      SELECT
        (
          SELECT COUNT(DISTINCT patientId)
          FROM NurseAssignments
          WHERE CAST(assignedAt AS DATE) = CAST(GETDATE() AS DATE)
        ) AS assignedPatients,

        (
          SELECT COUNT(*)
          FROM MedicationAdministration
          WHERE CAST(administeredAt AS DATE) = CAST(GETDATE() AS DATE)
        ) AS medicationTasks,

        (
          SELECT COUNT(DISTINCT patientId)
          FROM Vitals
          WHERE CAST(recordedAt AS DATE) = CAST(GETDATE() AS DATE)
        ) AS vitalsMonitored,
        (
          SELECT COUNT(*) 
          FROM Appointments
          WHERE patientCategory = 'Emergency'
          AND status IN ('Pending','Scheduled')
        ) AS emergencyPatients
    `);

    const stats = result.recordset[0];

    return NextResponse.json({
      assignedPatients: Number(stats.assignedPatients || 0),
      medicationTasks: Number(stats.medicationTasks || 0),
      vitalsMonitored: Number(stats.vitalsMonitored || 0),
      emergencyPatients: Number(stats.emergencyPatients || 0),

    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Failed to load nurse dashboard metrics"
      },
      {
        status: 500
      }
    );
  }
}