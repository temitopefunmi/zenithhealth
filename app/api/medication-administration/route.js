import { executeQuery } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();

        const {
            appointmentId,
            patientId,
            medication,
            dosage,
            frequency,
            route,
            status,
            administeredBy
        } = body;

        await executeQuery(
            `
            INSERT INTO MedicationAdministration
            (
                appointmentId,
                patientId,
                medication,
                dosage,
                frequency,
                route,
                status,
                administeredBy
            )
            VALUES
            (
                @appointmentId,
                @patientId,
                @medication,
                @dosage,
                @frequency,
                @route,
                @status,
                @administeredBy
            )
            `,
            {
                appointmentId,
                patientId,
                medication,
                dosage,
                frequency,
                route,
                status,
                administeredBy
            }
        );

        return NextResponse.json(
            { message: "Medication administration recorded" },
            { status: 201 }
        );

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Failed to record medication administration"
            },
            {
                status: 500
            }
        );
    }
}

export async function GET() {
    try {
        const result = await executeQuery(`
            SELECT TOP 10 *
            FROM MedicationAdministration
            ORDER BY administeredAt DESC
        `);

        return NextResponse.json(result.recordset);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Failed to fetch medication administration"
            },
            {
                status: 500
            }
        );
    }
}