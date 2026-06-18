import { executeQuery } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();

        const {
            appointmentId,
            patientId,
            doctorId,
            doctorEmail,
            note,
            createdBy
        } = body;

        await executeQuery(
            `
            INSERT INTO ClinicalNotes
            (
                appointmentId,
                patientId,
                doctorId,
                doctorEmail,
                note,
                createdBy
            )
            VALUES
            (
                @appointmentId,
                @patientId,
                @doctorId,
                @doctorEmail,
                @note,
                @createdBy
            )
            `,
            {
                appointmentId,
                patientId,
                doctorId,
                doctorEmail,
                note,
                createdBy
            }
        );

        return NextResponse.json(
            { message: "Clinical note created" },
            { status: 201 }
        );

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to create clinical note" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const result = await executeQuery(`
            SELECT *
            FROM ClinicalNotes
            ORDER BY createdAt DESC
        `);

        return NextResponse.json(result.recordset);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to fetch clinical notes" },
            { status: 500 }
        );
    }
}