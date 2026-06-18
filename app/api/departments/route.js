import { NextResponse } from "next/server";
import { executeQuery } from "../../../lib/db";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      departmentCode,
      departmentName,
      ward,
      floor,
      headDoctor
    } = body;

    await executeQuery(
      `
      INSERT INTO Departments
      (
        departmentCode,
        departmentName,
        ward,
        floor,
        headDoctor
      )
      SELECT
        @departmentCode,
        @departmentName,
        @ward,
        @floor,
        @headDoctor
      WHERE NOT EXISTS
      (
        SELECT 1
        FROM Departments
        WHERE departmentCode = @departmentCode
      )
      `,
      {
        departmentCode,
        departmentName,
        ward,
        floor,
        headDoctor
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}