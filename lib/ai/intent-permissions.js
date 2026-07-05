export const ALLOWED_INTENTS = {
  ADMIN: [
    "viewStatistics",
    "viewAppointments",
    "searchPatient",
    "searchEntity",
    "listEntity",
    "generateReport",
    "generateAnalytics",
    "viewSummary",
    "showPendingReviews",
    "showEmergencyCases",
    "showDepartmentMetrics",
    "showWaitingPatients"
  ],

  DOCTOR: [
    "viewAppointments",
    "viewMySchedule",
    "viewAssignedPatients",
    "searchPatient",
    "summarizePatientHistory",
    "showPatientVitals",
    "showPrescriptions",
    "draftConsultationNotes",
    "draftReferral",
    "draftFollowupNotes"
  ],

  NURSE: [
    "showWaitingPatients",
    "showTodaysQueue",
    "searchPatient",
    "bookAppointment",
    "rescheduleAppointment",
    "cancelAppointment",
    "checkInPatient",
    "recordVitals",
    "assistVitalsWorkflow",
    "generateHandoverSummary",
    "showMedicationSchedule",
    "showEmergencyPatients"
  ]
};