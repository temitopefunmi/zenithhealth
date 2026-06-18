import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET() {
  try {
    const doctors = await executeQuery(`
      SELECT
        fullName AS name,
        email,
        'Doctor' AS role,
        departmentCode AS department,
        'On Duty' AS status
      FROM Doctors
    `);

    const nurses = await executeQuery(`
      SELECT
        fullName AS name,
        email,
        'Nurse' AS role,
        departmentCode AS department,
        'On Duty' AS status
      FROM Nurses
    `);

    const staff = [
      ...doctors.recordset,
      ...nurses.recordset
    ];

    return NextResponse.json(staff);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load staff" },
      { status: 500 }
    );
  }
}