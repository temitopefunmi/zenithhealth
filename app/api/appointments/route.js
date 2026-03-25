import { executeQuery } from '../../../lib/db';
import { NextResponse } from 'next/server';

// 1. GET: Fetch all appointments including new AI columns
export async function GET() {
    try {
        const result = await executeQuery('SELECT * FROM Appointments ORDER BY createdAt DESC');
        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to fetch data from Azure" }, { status: 500 });
    }
}

// 2. POST: Now includes AI-extracted data from the Command Bar
export async function POST(request) {
    try {
        const body = await request.json();
        const { patient, doctor, priority, notes, isVerified } = body;

        await executeQuery(
            `INSERT INTO Appointments (patientName, doctor, appointmentDate, status, priority, aiReasoning, isVerified)
            VALUES (@patient, @doctor, GETDATE(), 'Scheduled', @priority, @notes, @isVerified)`,
            { 
                patient, 
                doctor, 
                priority: priority || 'Low', 
                notes: notes || '', 
                isVerified: isVerified || 0 
            }
        );

        return NextResponse.json({ message: "Draft appointment created!" }, { status: 201 });
    } catch (error) {
        console.error("Booking Error:", error);
        return NextResponse.json({ error: "Failed to create draft" }, { status: 500 });
    }
}

// 3. PATCH: The "Clinical Verification" endpoint for Doctors
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, isVerified, status } = body;

        // Updates the draft to a confirmed status
        await executeQuery(
            `UPDATE Appointments 
             SET isVerified = @isVerified, status = @status 
             WHERE id = @id`,
            { id, isVerified, status }
        );

        return NextResponse.json({ message: "Appointment verified by Doctor" });
    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: "Failed to verify appointment" }, { status: 500 });
    }
}