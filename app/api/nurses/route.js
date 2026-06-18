import { NextResponse } from "next/server";
import { executeQuery } from "../../../lib/db";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      nurseId,
      fullName,
      email,
      departmentCode,
      ward,
      defaultShift,
      status
    } = body;

    await executeQuery(
      `
      INSERT INTO Nurses
      (
        nurseId,
        fullName,
        email,
        departmentCode,
        ward,
        defaultShift,
        status
      )
      SELECT
        @nurseId,
        @fullName,
        @email,
        @departmentCode,
        @ward,
        @defaultShift,
        @status
      WHERE NOT EXISTS
      (
        SELECT 1
        FROM Nurses
        WHERE email = @email
      )
      `,
      {
        nurseId,
        fullName,
        email,
        departmentCode,
        ward,
        defaultShift,
        status
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to create nurse" },
      { status: 500 }
    );
  }
}