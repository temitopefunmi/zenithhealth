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
            patientId,
            appointmentNumber,
            doctorId,
            doctor,
            doctorEmail,
            appointmentDate,
            status,
            priority,
            notes,
            aiReasoning,
            isVerified,
            department,
            appointmentType,
            patientCategory,
            createdBy,
            lastUpdatedBy
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

        const result = await executeQuery(
            `INSERT INTO Appointments
            (
                patientId,
                appointmentNumber,
                patientName,
                doctorId,
                doctor,
                doctorEmail,
                appointmentDate,
                status,
                notes,
                priority,
                aiReasoning,
                isVerified,
                department,
                appointmentType,
                patientCategory,
                createdBy,
                lastUpdatedBy
            )
            OUTPUT inserted.id
            VALUES
            (
                @patientId,
                @appointmentNumber,
                @patient,
                @doctorId,
                @doctor,
                @doctorEmail,
                @appointmentDate,
                @status,
                @notes,
                @priority,
                @aiReasoning,
                @isVerified,
                @department,
                @appointmentType,
                @patientCategory
                @createdBy,
                @lastUpdatedBy
            )`,
            {
                patientId: patientId || null,

                appointmentNumber: appointmentNumber || null,
                
                patient: patient || "Unknown Patient",

                doctorId: doctorId || null,

                doctor: doctor || "Unassigned",

                doctorEmail: doctorEmail || null,

                appointmentDate: normalizedDate,

                status: status || "Pending",

                notes: notes || "No notes provided",

                priority: priority || "Low",

                aiReasoning: aiReasoning || "No reasoning provided",

                isVerified: isVerified || 0,

                department: department || "General Medicine",

                appointmentType: appointmentType || "Consultation",

                patientCategory: patientCategory || "Outpatient",

                createdBy: createdBy || "system",

                lastUpdatedBy: lastUpdatedBy || "system"
            }
        );
        const appointmentId = result.recordset[0].id;
        return NextResponse.json(
            { message: "Draft appointment created!", 
                id: appointmentId,
                appointmentNumber 
            },
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

/**
 * DELETE all demo data
 * Development only
 */
export async function DELETE() {
    try {
        // Delete child tables first
        await executeQuery("DELETE FROM NurseAssignments");
        await executeQuery("DELETE FROM ClinicalNotes");
        await executeQuery("DELETE FROM MedicationAdministration");
        await executeQuery("DELETE FROM Vitals");
        await executeQuery("DELETE FROM Prescriptions");

        // Delete main tables
        await executeQuery("DELETE FROM Appointments");
        await executeQuery("DELETE FROM Patients");
       

        // Reset identity values
        await executeQuery(
            "DBCC CHECKIDENT ('NurseAssignments', RESEED, 0)"
        );

        await executeQuery(
            "DBCC CHECKIDENT ('ClinicalNotes', RESEED, 0)"
        );

        await executeQuery(
            "DBCC CHECKIDENT ('MedicationAdministration', RESEED, 0)"
        );

        await executeQuery(
            "DBCC CHECKIDENT ('Vitals', RESEED, 0)"
        );

       await executeQuery (
            "DBCC CHECKIDENT ('Prescriptions', RESEED, 0)"
       )

        await executeQuery(
            "DBCC CHECKIDENT ('Appointments', RESEED, 0)"
        );

        await executeQuery(
            "DBCC CHECKIDENT ('Patients', RESEED, 0)"
        );


        return NextResponse.json({
            message: "Demo data reset successfully"
        });

    } catch (error) {
        console.error("Reset Error:", error);

        return NextResponse.json(
            {
                error: "Failed to reset demo data"
            },
            {
                status: 500
            }
        );
    }
}