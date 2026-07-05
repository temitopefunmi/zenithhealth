export const INTENT_CAPABILITIES = {
  // appointments
  viewAppointments: "appointments",
  viewMySchedule: "appointments",
  bookAppointment: "appointments",
  rescheduleAppointment: "appointments",
  cancelAppointment: "appointments",
  checkInPatient: "appointments",

  // patients
  searchPatient: "patients",
  searchEntity: "patients",
  listEntity: "patients",
  viewAssignedPatients: "patients",

  // clinical
  summarizePatientHistory: "clinical",
  showPatientVitals: "clinical",
  showPrescriptions: "clinical",
  recordVitals: "clinical",
  assistVitalsWorkflow: "clinical",
  generateHandoverSummary: "clinical",

  // documentation
  draftConsultationNotes: "documentation",
  draftReferral: "documentation",
  draftFollowupNotes: "documentation",

  // queue
  showWaitingPatients: "queue",
  showTodaysQueue: "queue",

  // operations
  viewStatistics: "operations",
  showPendingReviews: "operations",
  showEmergencyCases: "operations",
  showDepartmentMetrics: "operations",

  // reporting
  generateReport: "reporting",
  generateAnalytics: "reporting",
  viewSummary: "reporting",

  // medications
  showMedicationSchedule: "medications"
};