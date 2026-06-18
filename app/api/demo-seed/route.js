import { executeQuery } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      appointment,
      clinicalNote,
      prescription,
      vitals,
      medicationAdministration,
      nurseAssignment
    } = body;

    // -----------------------------
    // Create Appointment
    // -----------------------------

    const result = await executeQuery(
      `
      INSERT INTO Appointments
      (
        patientId,
        patientName,
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
      )
      OUTPUT INSERTED.id
      VALUES
      (
        @patientId,
        @patientName,
        @appointmentNumber,
        @doctorId,
        @doctor,
        @doctorEmail,
        @appointmentDate,
        @status,
        @priority,
        @notes,
        @aiReasoning,
        @isVerified,
        @department,
        @appointmentType,
        @patientCategory,
        @createdBy,
        @lastUpdatedBy
      )
      `,
      {
        patientId: appointment.patientId,
        patientName: appointment.patient,
        appointmentNumber: appointment.appointmentNumber,
        doctorId: appointment.doctorId,
        doctor: appointment.doctor,
        doctorEmail: appointment.doctorEmail,
        appointmentDate: appointment.appointmentDate,
        status: appointment.status,
        priority: appointment.priority,
        notes: appointment.notes,
        aiReasoning: appointment.aiReasoning,
        isVerified: appointment.isVerified,
        department: appointment.department,
        appointmentType: appointment.appointmentType,
        patientCategory: appointment.patientCategory,
        createdBy: appointment.createdBy,
        lastUpdatedBy: appointment.lastUpdatedBy
      }
    );

    const appointmentId = result.recordset[0].id;

    // -----------------------------
    // Create Clinical Note
    // -----------------------------

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

        patientId: appointment.patientId,

        doctorId: appointment.doctorId,

        doctorEmail: appointment.doctorEmail,

        note: clinicalNote.note,

        createdBy: clinicalNote.createdBy
    }
    );

    // -----------------------------
    // Create Prescription
    // -----------------------------

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

        patientId: appointment.patientId,

        doctorId: appointment.doctorId,

        doctorEmail: appointment.doctorEmail,

        medication: prescription.medication,

        dosage: prescription.dosage,

        frequency: prescription.frequency,

        duration: prescription.duration,

        instructions: prescription.instructions,

        status: prescription.status
    }
    );

    // -----------------------------
    // Create Vitals
    // -----------------------------

    if (vitals) {
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

        patientId: appointment.patientId,

        recordedBy: vitals.recordedBy,

        temperature: vitals.temperature,

        heartRate: vitals.heartRate,

        bloodPressure: vitals.bloodPressure,

        respiratoryRate: vitals.respiratoryRate,

        oxygenSaturation: vitals.oxygenSaturation,

        weight: vitals.weight,

        height: vitals.height
    }
    );
}

    // -----------------------------
    // Create Medication Administration
    // -----------------------------

    if (medicationAdministration) {
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

            patientId: appointment.patientId,

            medication: medicationAdministration.medication,

            dosage: medicationAdministration.dosage,

            frequency: medicationAdministration.frequency,

            route: medicationAdministration.route,

            status: medicationAdministration.status,

            administeredBy: medicationAdministration.administeredBy
        }
    );
}

    // -----------------------------
    // Create Nurse Assignment
    // -----------------------------

    if (nurseAssignment) {
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
            assignmentId: nurseAssignment.assignmentId,

            appointmentId,

            patientId: appointment.patientId,

            nurseEmail: nurseAssignment.nurseEmail,

            ward: nurseAssignment.ward,

            department: nurseAssignment.department,

            shift: nurseAssignment.shift,

            status: nurseAssignment.status,

            assignedBy: nurseAssignment.assignedBy
        }
        );
    }

    return NextResponse.json(
        {success: true}, 
        {status: 201}
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Demo seed failed"
      },
      {
        status: 500
      }
    );
  }
}