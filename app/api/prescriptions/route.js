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
            medication,
            dosage,
            frequency,
            duration,
            instructions,
            status
        } = body;
        await executeQuery(
            `
            INSERT INTO Prescriptions
            (
                appointmentId,
                patientId,
                doctorId,
                doctorEmail,
                medication,
                dosage,
                frequency,
                duration,
                instructions,
                status
            )
            VALUES
            (
                @appointmentId,
                @patientId,
                @doctorId,
                @doctorEmail,
                @medication,
                @dosage,
                @frequency,
                @duration,
                @instructions,
                @status
            )
            `,
            {
                appointmentId,
                patientId,
                doctorId,
                doctorEmail,
                medication,
                dosage,
                frequency,
                duration,
                instructions,
                status
            }
        );

        return NextResponse.json(
            { message: "Prescription created successfully" },
            { status: 201 }
        );
    }   catch (error) { 
        console.error("Prescription Creation Error:", error);
        return NextResponse.json(
            { error: "Failed to create prescription" },
            { status: 500 }
        );
    }
}

// List prescriptions
export async function GET() {
    try {
        const result = await executeQuery(
            `
            SELECT * 
            FROM Prescriptions
            ORDER BY createdAt DESC
            `
        );

        return NextResponse.json(result.recordset );
    } catch (error) {
        console.error("Prescription Retrieval Error:", error);
        return NextResponse.json(
            { error: "Failed to retrieve prescriptions" },
            { status: 500 }
        );
    }
}



export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        await executeQuery(
            `
            UPDATE Prescriptions
            SET status = @status
            WHERE id = @id
            `,
            { id, status }
        );

        return NextResponse.json(
            { message: "Prescription updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Prescription Update Error:", error);
        return NextResponse.json(
            { error: "Failed to update prescription" },
            { status: 500 }
        );
    }
}

