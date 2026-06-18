import { NextResponse } from "next/server";
import { executeQuery } from "../../../lib/db";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      doctorId,
      fullName,
      email,
      departmentCode,
      specialization,
      status
    } = body;

    await executeQuery(
      `
      INSERT INTO Doctors
      (
        doctorId,
        fullName,
        email,
        departmentCode,
        specialization,
        status
      )
      SELECT
        @doctorId,
        @fullName,
        @email,
        @departmentCode,
        @specialization,
        @status
      WHERE NOT EXISTS
      (
        SELECT 1
        FROM Doctors
        WHERE email = @email
      )
      `,
      {
        doctorId,
        fullName,
        email,
        departmentCode,
        specialization,
        status
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to create doctor" },
      { status: 500 }
    );
  }
}