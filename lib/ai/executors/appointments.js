import { executeQuery } from "@/lib/db";

export async function executeAppointmentIntent(
  intent,
  parameters,
  session
) {
  switch (intent) {
    case "viewAppointments":
      return viewAppointments(
        session,
        parameters
      );

    case "viewMySchedule":
      return viewMySchedule(
        session,
        parameters
      );

    case "bookAppointment":
      return bookAppointment(
        parameters
      );

    case "rescheduleAppointment":
      return rescheduleAppointment(
        parameters
      );

    case "cancelAppointment":
      return cancelAppointment(
        parameters
      );

    case "checkInPatient":
      return checkInPatient(
        parameters
      );

    default:
      return {
        type: "message",
        message:
          "Appointment capability not implemented."
      };
  }
}

async function viewAppointments(
  session,
  parameters
) {
    const role = session?.user?.role;
  //
  // Doctor → detailed appointments
  //
  if (
    role === "DOCTOR" &&
    parameters.scope === "mine"
  ) {
    return await getDoctorAppointments(
      session,
      parameters
    );
  }

  //
  // Admin → aggregated statistics
  //
  if (
    role === "ADMIN" &&
    parameters.scope === "doctor"
  ) {
      if (!parameters.doctorName) {
    return {
      type: "message",
      message:
        "Please specify which doctor's appointments you'd like to view. For example: 'Show Dr Amina Bello's appointments today.'"
    };
    }
    return await getDoctorAppointmentStats(
      parameters
    );
  }

  //
  // Invalid combinations
  //
  if (
    role === "ADMIN" &&
    parameters.scope === "mine"
  ) {
    return {
      type: "message",
      message:
        "Administrators do not have personal appointment schedules.",
    };
  }

  if (
    role === "DOCTOR" &&
    parameters.scope === "doctor"
  ) {
    return {
      type: "message",
      message:
        "You are not authorized to view another doctor's appointments.",
    };
  }

  return {
    type: "message",
    message:
      "Invalid appointment request.",
  };
}

async function getDoctorAppointments(
  session,
  parameters
) {
  let dateFilter = `
    appointmentDate >= GETDATE()
  `;

    if (parameters.dateRange === "today") {
    dateFilter = `
        CAST(appointmentDate AS DATE)
        = CAST(GETDATE() AS DATE)
    `;
    }

    if (parameters.dateRange === "week") {
    dateFilter = `
        appointmentDate >= GETDATE()
        AND appointmentDate <
        DATEADD(day,7,GETDATE())
    `;
    }

    if (parameters.dateRange === "month") {
    dateFilter = `
        appointmentDate >= GETDATE()
        AND appointmentDate <
        DATEADD(month,1,GETDATE())
    `;
    }

  const result = await executeQuery(
    `
    SELECT
      patientName,
      appointmentDate,
      appointmentType,
      status,
      priority
    FROM Appointments
    WHERE doctorEmail = @doctorEmail
    AND ${dateFilter}
    ORDER BY appointmentDate
    `,
    {
      doctorEmail: session.user.email,
    }
  );

  return {
    type: "appointments",
    data: result.recordset,
  };
}

async function getDoctorAppointmentStats(
  parameters
) {
    let dateFilter = `
        appointmentDate >= GETDATE()
        `;
    if (parameters.timeRange === "today") {
        dateFilter = `
            CAST(appointmentDate AS DATE)
            = CAST(GETDATE() AS DATE)
        `;
        }

    if (parameters.timeRange === "week") {
        dateFilter = `
            appointmentDate >= GETDATE()
            AND appointmentDate <
            DATEADD(day,7,GETDATE())
        `;
        }

    if (parameters.timeRange === "month") {
        dateFilter = `
            appointmentDate >= GETDATE()
            AND appointmentDate <
            DATEADD(month,1,GETDATE())
        `;
        }
  const result = await executeQuery(
    `
    SELECT
      COUNT(*) AS totalAppointments,

      SUM(
        CASE
          WHEN status = 'Completed'
          THEN 1
          ELSE 0
        END
      ) AS completed,

      SUM(
        CASE
          WHEN status = 'Pending'
          THEN 1
          ELSE 0
        END
      ) AS pending,

      SUM(
        CASE
          WHEN status = 'Scheduled'
          THEN 1
          ELSE 0
        END
      ) AS scheduled

    FROM Appointments
    WHERE doctor LIKE '%' + @doctorName + '%'
    AND ${dateFilter}
    `,
    {
      doctorName:
        parameters.doctorName,
    }
  );

  return {
    type: "doctorAppointmentStats",
    scope: "doctor",
    data: {
      doctorName:
        parameters.doctorName,
      ...result.recordset[0],
    },
  };
}

async function viewMySchedule() {
  return {
    type: "message",
    message: "Not implemented yet."
  };
}

async function bookAppointment() {
  return {
    type: "message",
    message: "Not implemented yet."
  };
}

async function rescheduleAppointment() {
  return {
    type: "message",
    message: "Not implemented yet."
  };
}

async function cancelAppointment() {
  return {
    type: "message",
    message: "Not implemented yet."
  };
}

async function checkInPatient() {
  return {
    type: "message",
    message: "Not implemented yet."
  };
}

