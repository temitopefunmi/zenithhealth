import { executeQuery } from '../../../lib/db';
import { NextResponse } from 'next/server';

/**
 * GET all appointments
 */
export async function GET() {
    try {
        const result = await executeQuery(
            'SELECT * FROM Appointments ORDER BY createdAt DESC'
        );

        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch data from Azure" },
            { status: 500 }
        );
    }
}

/**
 * POST a new appointment draft
 *
 * Flow:
 * - AI sends extracted fields
 * - We validate the date if one exists
 * - We store the appointment
 *
 * Date rule:
 * - If appointmentDate exists, validate it and store it
 * - If appointmentDate is missing, allow a partial draft with null
 */
export async function POST(request) {
    try {
        const body = await request.json();

        const {
            patient,
            doctor,
            appointmentDate,
            priority,
            notes,
            aiReasoning,
            isVerified
        } = body;

        let normalizedDate = null;

        /**
         * If AI returned a date, validate it.
         * If AI returned null, we still allow draft creation.
         */
        if (appointmentDate) {
            const parsedDate = new Date(appointmentDate);

            if (isNaN(parsedDate.getTime())) {
                return NextResponse.json(
                    { error: "Invalid appointment date" },
                    { status: 400 }
                );
            }

            /**
             * Store as ISO string for consistency.
             * This keeps the format standard across the system.
             */
            normalizedDate = parsedDate.toISOString();
        }

        await executeQuery(
            `INSERT INTO Appointments
            (
                patientName,
                doctor,
                appointmentDate,
                status,
                notes,
                priority,
                aiReasoning,
                isVerified
            )
            VALUES
            (
                @patient,
                @doctor,
                @appointmentDate,
                'Pending',
                @notes,
                @priority,
                @aiReasoning,
                @isVerified
            )`,
            {
                patient: patient || 'Unknown Patient',
                doctor: doctor || 'Unassigned',
                appointmentDate: normalizedDate,
                notes: notes || 'No notes provided',
                priority: priority || 'Low',
                aiReasoning: aiReasoning || 'No reasoning provided',
                isVerified: isVerified || 0
            }
        );

        return NextResponse.json(
            { message: "Draft appointment created!" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Booking Error:", error);
        return NextResponse.json(
            { error: "Failed to create draft" },
            { status: 500 }
        );
    }
}

/**
 * PATCH appointment after doctor review
 */
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, isVerified, status } = body;

        await executeQuery(
            `UPDATE Appointments
             SET isVerified = @isVerified,
                 status = @status
             WHERE id = @id`,
            { id, isVerified, status }
        );

        return NextResponse.json({
            message: "Appointment verified by Doctor"
        });
    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json(
            { error: "Failed to verify appointment" },
            { status: 500 }
        );
    }
}