import { executeQuery } from "@/lib/db";

export async function executeOperationsIntent(
  intent,
  parameters,
  session
) {
  switch (intent) {
    case "showPendingReviews":
      return getPendingReviews();

    case "viewStatistics":
      return getStatistics();

    default:
      return {
        type: "message",
        message:
          "Operations capability not implemented."
      };
  }
}   

async function getPendingReviews() {
  const result = await executeQuery(`
    SELECT
      patientName,
      appointmentDate,
      doctor,
      priority,
      status
    FROM Appointments
    WHERE status = 'Pending'
    ORDER BY appointmentDate
  `);

  return {
    type: "pendingReviews",
    data: result.recordset,
  };
}

async function getStatistics() {
  const result = await executeQuery(`
    SELECT
      (
        SELECT COUNT(*)
        FROM Appointments
        WHERE CAST(appointmentDate AS DATE)
          = CAST(GETDATE() AS DATE)
      ) AS appointmentsToday,

      (
        SELECT COUNT(*)
        FROM Appointments
        WHERE status = 'Pending'
      ) AS pendingReviews,

      (
        SELECT COUNT(*)
        FROM Appointments
        WHERE status = 'Completed'
      ) AS completedAppointments,

      (
        SELECT COUNT(*)
        FROM Appointments
        WHERE patientCategory = 'Emergency'
        AND status IN ('Pending','Scheduled')
      ) AS emergencyCases
  `);

  return {
    type: "statistics",
    data: result.recordset[0],
  };
}