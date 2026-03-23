import { executeQuery } from '../../../lib/db';
import { NextResponse } from 'next/server';

// This function handles the GET request to /api/appointments
export async function GET() {
    try {
        // Query your Azure SQL Database
        const result = await executeQuery('SELECT * FROM Appointments ORDER BY createdAt DESC');
        
        // Return the data as JSON to your frontend
        return NextResponse.json(result.recordset);
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: "Failed to fetch data from Azure" }, { status: 500 });
    }
}

// --- New POST Function ---
export async function POST(request) {
    try {
        const body = await request.json();
        const { patient, doctor } = body;

        // Securely insert using parameters to prevent SQL injection
        await executeQuery(
            `INSERT INTO Appointments (patientName, doctor, appointmentDate, status)
            VALUES (@patient, @doctor, GETDATE(), 'Scheduled')`,
            { patient, doctor }
        );

        return NextResponse.json({ message: "Appointment booked!" }, { status: 201 });
    } catch (error) {
        console.error("Booking Error:", error);
        return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
    }
}