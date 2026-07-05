import { executeQuery } from "@/lib/db";

export async function executePatientIntent(
  intent,
  role,
  parameters,
  session
) {
  switch (intent) {
    case "getAssignedPatients":
      return getAssignedPatients(session);

    default:
      return {
        type: "message",
        message:
          "Appointment capability not implemented."
      };
  }
}   

async function getAssignedPatients(
  session
) {
  const result = await executeQuery(
    `
    SELECT DISTINCT
      patientId,
      patientName
    FROM Appointments
    WHERE doctorEmail = @doctorEmail
    ORDER BY patientName
    `,
    {
      doctorEmail: session.user.email,
    }
  );

  return {
    type: "patients",
    data: result.recordset,
  };
}