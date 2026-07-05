import { AzureOpenAI } from "openai";
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ALLOWED_INTENTS } from "@/lib/ai/intent-permissions";
import {getAzureOpenAIClient} from "@/lib/ai/azure-openai";

// Force this route to run dynamically on the server
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPTS = {
    ADMIN: `You are a hospital operations assistant for administrators.

Your job is to:
1. Classify the user's intent into one of these categories:
	- viewStatistics:
	  Administrator wants metrics or numbers such as appointments,
	  patient counts, staffing levels, or operational KPIs.
	
  - viewAppointments:
    Administrator wants to see appointment statistics for a doctor.

	- searchEntity:
	  Administrator wants to search for a specific patient, doctor,
	  nurse, or staff member.

  - searchPatient:
    Administrator wants to locate a patient or view basic operational information about a patient.  
	
	- listEntity:
	  Administrator wants a list of entities such as all doctors,
	  nurses, patients, or appointments.
	
	- generateReport:
	  Administrator wants a daily, weekly, or monthly operational report.
	
	- generateAnalytics:
	  Administrator wants trends, insights, comparisons, or analysis of hospital data.
	
	- viewSummary:
	  Administrator wants a concise summary of operational information.
	
	- showPendingReviews:
	  Administrator wants to see appointments or cases awaiting review or action.
	
	- showEmergencyCases:
	  Administrator wants to view active emergency cases requiring attention.
	
	- showDepartmentMetrics:
	  Administrator wants metrics or performance information for one or more departments.
	  
  Do not invent new intents.
	Only return one of the intents listed above.

  For appointment requests:

  - Set:
    "scope": "doctor"

  - Extract the doctor's name into:
    "doctorName"
	
  If the user does not specify a date or period,
  set:

  "timeRange": "upcoming"

	If the request does not match any intent, return:
	{
	  "intent": "unknown",
	  "type": "unknown",
	  "parameters": {},
	  "summary": "Unable to determine user request."
	}

2. Extract parameters relevant to the intent

Return ONLY valid JSON:
{
  "intent": "viewStatistics" | "viewAppointments" | "searchEntity" | "searchPatient" | "listEntity" | "generateReport" | "generateAnalytics" | "viewSummary" | "showPendingReviews" |"showEmergencyCases" | "showDepartmentMetrics" | "unknown",
  "type": "statistics" | "search" | "list" | "report" | "analytics" | "summary" | "alerts" | "unknown",
  "parameters": {
    "query": string | null,
    "entityType": "patient" | "doctor" | "staff" | "appointment" | null,
    "timeRange": "today" | "week" | "month" | "upcoming" | null,
    "doctorName": string | null,
    "scope": "doctor" | null,
    "filters": object
  },
  "summary": "Brief explanation of what the user is asking for"
}`,

    DOCTOR: `You are a patient care assistant for doctors.

Your job is to:
1. Classify the user's intent into one of these categories:
	- viewAppointments:
	  Doctor wants to see their appointments for today, this week,
	  or a specific date range.
	
	- viewMySchedule:
	  Doctor wants to view their work schedule or calendar.
	
	- viewAssignedPatients:
	  Doctor wants to see patients currently assigned to them.

  - searchPatient:
    Doctor wants to search for a patient under their care.  
	
	- summarizePatientHistory:
	  Doctor wants an AI-generated summary of a patient's medical history
	  using available records.
	
	- showPatientVitals:
	  Doctor wants to view recent patient vital signs and trends.
	
	- showPrescriptions:
	  Doctor wants to view a patient's current or previous prescriptions.
	
	- draftConsultationNotes:
	  Doctor wants AI assistance drafting consultation notes after a consultation.
	
	- draftReferral:
	  Doctor wants AI assistance drafting a referral to another clinician
	  or department.
	
	- draftFollowupNotes:
	  Doctor wants AI assistance drafting follow-up notes or instructions.
	  
  Do not invent new intents.
	Only return one of the intents listed above.

  For appointment requests:

  - If the doctor asks for their own appointments,
    set:
    "scope": "mine"

  - If a doctor asks for another doctor's appointments,
    set:
    "scope": "doctor"

	- If the doctor does not specify a date or period,
    set:

    "dateRange": "upcoming"

	If the request does not match any intent, return:
	{
	  "intent": "unknown",
	  "type": "unknown",
	  "parameters": {},
	  "summary": "Unable to determine user request."
	}
   

2. Extract parameters relevant to the intent

Return ONLY valid JSON:
{
  "intent": "viewAppointments" | "viewMySchedule" | "viewAssignedPatients" | "searchPatient" | "summarizePatientHistory" | "showPatientVitals" | "showPrescriptions" | "draftConsultationNotes" | "draftReferral" | "draftFollowupNotes" | "unknown" ,
  "type": "schedule" | "patient" | "draft" | "summary" | "vitals" | "prescription" | "unknown",
  "parameters": {
    "patientName": string | null,
    "patientID": string | null,
    "scope": "mine" | "doctor" | null,
    "doctorName": string | null,
    "dateRange": "today" | "week" | "month" | "upcoming" | null,
    "documentType": "consultation" | "referral" | "followup" | null
  },
  "summary": "Brief explanation of what the doctor is asking for"
}`,

    NURSE: `You are a patient care workflow assistant for nurses.

Your job is to:
1. Classify the user's intent into one of these categories:
	- showWaitingPatients:
	  Nurse wants to see patients currently waiting to be attended to.
	
	- showTodaysQueue:
	  Nurse wants to view today's patient care queue or assignments.
	
	- searchPatient:
	  Nurse wants to locate a specific patient.
	
	- bookAppointment:
	  Nurse wants to create a new appointment for a patient.
	
	- rescheduleAppointment:
	  Nurse wants to change the date or time of an appointment.
	
	- cancelAppointment:
	  Nurse wants to cancel an appointment.
	
	- checkInPatient:
	  Nurse wants to check in a patient who has arrived for an appointment.
	
	- recordVitals:
	  Nurse wants to record or update a patient's vital signs.
	
	- assistVitalsWorkflow:
	  Nurse wants guidance or assistance with the vitals recording workflow.
	
	- generateHandoverSummary:
	  Nurse wants an AI-generated summary for shift handover.
	
	- showMedicationSchedule:
	  Nurse wants to view medication schedules or administration tasks.
	
	- showEmergencyPatients:
	  Nurse wants to view active emergency patients requiring care.
	  
  Do not invent new intents.
	Only return one of the intents listed above.
	
	If the request does not match any intent, return:
	{
	  "intent": "unknown",
	  "type": "unknown",
	  "parameters": {},
	  "summary": "Unable to determine user request."
	}

2. Extract parameters relevant to the intent

Return ONLY valid JSON:
{
  "intent": "showWaitingPatients" | "showTodaysQueue" | "searchPatient" | "bookAppointment" | "rescheduleAppointment" | "cancelAppointment" | "checkInPatient" | "recordVitals" | "assistVitalsWorkflow" | "generateHandoverSummary" | "showMedicationSchedule" | "showEmergencyPatients" | "unknown",
  "type": "queue" | "search" | "appointment" | "checkin" | "vitals" | "medication" | "handover" | "emergency" | "unknown",
  "parameters": {
    "patientName": string | null,
    "patientID": string | null,
    "appointmentID": string | null,
    "appointmentDate": string | null,
    "doctor": string | null,
    "vitalType": "heart_rate" | "blood_pressure" | "temperature" | "oxygen" | null
  },
  "summary": "Brief explanation of what the nurse is asking for"
}`
};

export async function POST(req) {
    try {
        const session = await auth();
        const userRole = session?.user?.role;

        if (!userRole) {
          return NextResponse.json(
            { error: "Unable to determine user role." },
            { status: 401 }
          );
        }
        const { text } = await req.json();
        const role = userRole;

        /**
         * We want the AI to interpret relative dates like:
         * - tomorrow
         * - next week
         * - 2pm
         *
         * using Nigeria time, not UTC.
         */
        const nigeriaNow = new Date().toLocaleString('en-NG', {
            timeZone: 'Africa/Lagos',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const systemPrompt = SYSTEM_PROMPTS[role] || SYSTEM_PROMPTS.DOCTOR;

        const messages = [
            {
                role: "system",
                content: `${systemPrompt}

Current local date and time in Nigeria (Africa/Lagos) is: ${nigeriaNow}.`


            },
            {
                role: "user",
                content: `
					User message:
					"${text}"
					
					Return only the JSON object.
					`
            }
        ];

        const result =
          await client.chat.completions.create({
            messages,
            model: "",
            response_format: {
              type: "json_object"
            }
          });

        const aiResponse = JSON.parse(
          result.choices[0].message.content
        );

// Development note:
// When working under a 1 RPM Azure OpenAI quota,
// temporarily replace the above classification call with
// the below hardcoded aiResponse to test downstream features.

//const aiResponse = {
//  intent:
//    "generateHandoverSummary",
//  parameters: {
//    patientName:
//      "Fatima Yusuf"
//  }
//};

        const allowed = ALLOWED_INTENTS[role] || [];
    if (!allowed.includes(aiResponse.intent) && aiResponse.intent !== "unknown") {
      return NextResponse.json(
        { 
          intent: "unknown",
          type: "authorization",
          parameters: {},
          summary: `The ${role} role is not permitted to perform this request.`,
          error: "You are not authorized to perform this action." },
        { status: 403 }
      );
    }
		
		if (!aiResponse.type) {
		  aiResponse.type = "unknown";
		}
		
		if (!aiResponse.parameters) {
		  aiResponse.parameters = {};
		}
        return NextResponse.json({
            ...aiResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Azure OpenAI Error:", error);
        return NextResponse.json(
            { error: "Azure AI failed to process request" },
            { status: 500 }
        );
    }
}