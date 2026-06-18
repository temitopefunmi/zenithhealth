import { executeQuery } from "../../../lib/db";
import { NextResponse } from "next/server";

/**
 * GET all nurse assignments
 */
export async function GET() {
  try {
    const result = await executeQuery(`
      SELECT TOP 10 *
      FROM NurseAssignments
      ORDER BY assignedAt DESC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch nurse assignments",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST nurse assignment
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      assignmentId,
      appointmentId,
      patientId,
      nurseEmail,
      ward,
      department,
      shift,
      status,
      assignedBy,
    } = body;

    await executeQuery(
      `
      INSERT INTO NurseAssignments
      (
        assignmentId,
        appointmentId,
        patientId,
        nurseEmail,
        ward,
        department,
        shift,
        status,
        assignedBy
      )
      VALUES
      (
        @assignmentId,
        @appointmentId,
        @patientId,
        @nurseEmail,
        @ward,
        @department,
        @shift,
        @status,
        @assignedBy
      )
      `,
      {
        assignmentId,
        appointmentId,
        patientId,
        nurseEmail,
        ward,
        department,
        shift,
        status,
        assignedBy,
      }
    );

    return NextResponse.json(
      {
        message: "Nurse assignment created",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create nurse assignment",
      },
      {
        status: 500,
      }
    );
  }
}