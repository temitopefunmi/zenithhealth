import { executeQuery } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();

        const {
            appointmentId,
            patientId,
            recordedBy,
            temperature,
            heartRate,
            bloodPressure,
            respiratoryRate,
            oxygenSaturation,
            weight,
            height
        } = body;

        await executeQuery(
            `
            INSERT INTO Vitals
            (
                appointmentId,
                patientId,
                recordedBy,
                temperature,
                heartRate,
                bloodPressure,
                respiratoryRate,
                oxygenSaturation,
                weight,
                height
            )
            VALUES
            (
                @appointmentId,
                @patientId,
                @recordedBy,
                @temperature,
                @heartRate,
                @bloodPressure,
                @respiratoryRate,
                @oxygenSaturation,
                @weight,
                @height
            )
            `,
            {
                appointmentId,
                patientId,
                recordedBy,
                temperature,
                heartRate,
                bloodPressure,
                respiratoryRate,
                oxygenSaturation,
                weight,
                height
            }
        );

        return NextResponse.json(
            { message: "Vitals recorded" },
            { status: 201 }
        );

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to record vitals" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const result = await executeQuery(`
            SELECT TOP 10 *
            FROM Vitals
            ORDER BY recordedAt DESC
        `);

        return NextResponse.json(result.recordset);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to fetch vitals" },
            { status: 500 }
        );
    }
}