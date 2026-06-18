import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET() {
  try {
    const outpatient = await executeQuery(`
      SELECT COUNT(*) AS count
      FROM Appointments
      WHERE patientCategory = 'Outpatient'
    `);

    const inpatient = await executeQuery(`
      SELECT COUNT(*) AS count
      FROM Appointments
      WHERE patientCategory = 'Inpatient'
    `);

    const emergency = await executeQuery(`
      SELECT COUNT(*) AS count
      FROM Appointments
      WHERE patientCategory = 'Emergency'
    `);

    const total =
      outpatient.recordset[0].count +
      inpatient.recordset[0].count +
      emergency.recordset[0].count;

    return NextResponse.json({
      total,
      outpatient: outpatient.recordset[0].count,
      inpatient: inpatient.recordset[0].count,
      emergency: emergency.recordset[0].count,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load resource data" },
      { status: 500 }
    );
  }
}