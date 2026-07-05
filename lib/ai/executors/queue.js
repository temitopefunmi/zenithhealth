import { executeQuery } from "@/lib/db";

export async function executeQueueIntent(
  intent,
  role,
  parameters,
  session
) {
  switch (intent) {
    case "showTodaysQueue":
      return getTodaysQueue();

    default:
      return {
        type: "message",
        message:
          "Queue capability not implemented."
      };
  }
}

async function getTodaysQueue() {
  const result = await executeQuery(`
    SELECT
      patientName,
      appointmentDate,
      priority,
      status,
      patientCategory
    FROM Appointments
    WHERE CAST(appointmentDate AS DATE)
      = CAST(GETDATE() AS DATE)
    AND status IN ('Pending','Scheduled')
    ORDER BY
      CASE
        WHEN priority = 'High' THEN 1
        WHEN priority = 'Medium' THEN 2
        ELSE 3
      END,
      appointmentDate
  `);

  return {
    type: "queue",
    data: result.recordset,
  };
}