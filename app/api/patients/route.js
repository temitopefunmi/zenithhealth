import { executeQuery } from "../../../lib/db";
import { NextResponse } from "next/server";

/**
 * GET all patients
 */
export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT *
      FROM Patients
      ORDER BY createdAt DESC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch patients",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST new patient
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      patientId,
      fullName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      emergencyContactName,
      emergencyContactPhone,
      bloodGroup,
      nationalId,
      insuranceProvider,
      insuranceNumber,
    } = body;

    await executeQuery(
      `
      INSERT INTO Patients
      (
        patientId,
        fullName,
        dateOfBirth,
        gender,
        phone,
        email,
        address,
        emergencyContactName,
        emergencyContactPhone,
        bloodGroup,
        nationalId,
        insuranceProvider,
        insuranceNumber
      )
      VALUES
      (
        @patientId,
        @fullName,
        @dateOfBirth,
        @gender,
        @phone,
        @email,
        @address,
        @emergencyContactName,
        @emergencyContactPhone,
        @bloodGroup,
        @nationalId,
        @insuranceProvider,
        @insuranceNumber
      )
      `,
      {
        patientId,
        fullName,
        dateOfBirth,
        gender,
        phone,
        email,
        address,
        emergencyContactName,
        emergencyContactPhone,
        bloodGroup,
        nationalId,
        insuranceProvider,
        insuranceNumber,
      }
    );

    return NextResponse.json(
      {
        message: "Patient created",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create patient",
      },
      {
        status: 500,
      }
    );
  }
}