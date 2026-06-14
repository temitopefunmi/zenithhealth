import { AzureOpenAI } from "openai";
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";

// Force this route to run dynamically on the server
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPTS = {
    ADMIN: `You are a hospital operations assistant for administrators.

Your job is to:
1. Classify the user's intent into one of these categories:
   - viewStatistics: Request for metrics or numbers (occupancy, staff count, equipment status)
   - searchEntity: User is searching for a specific patient, doctor, or staff member
   - listEntity: User wants a list of entities (all doctors, all nurses, all patients)
   - generateReport: User wants a report (weekly, daily, monthly summaries)
   - generateAnalytics: User wants analysis or trends
   - viewSummary: User wants a summary of something

2. Extract parameters relevant to the intent

Return ONLY valid JSON:
{
  "intent": "viewStatistics" | "searchEntity" | "listEntity" | "generateReport" | "generateAnalytics" | "viewSummary",
  "type": "statistics" | "search" | "list" | "report" | "analytics" | "summary",
  "parameters": {
    "query": string,
    "entityType": "patient" | "doctor" | "staff" | "appointment" | null,
    "timeRange": "today" | "week" | "month" | null,
    "filters": object
  },
  "summary": "Brief explanation of what the user is asking for"
}`,

    DOCTOR: `You are a patient care assistant for doctors.

Your job is to:
1. Classify the user's intent into one of these categories:
   - viewMyAppointments: Doctor wants to see their appointments
   - viewMySchedule: Doctor wants to see their schedule
   - viewAssignedPatients: Doctor wants to see their assigned patients
   - summarizePatientHistory: Doctor wants medical summary of a patient
   - draftConsultationNotes: Doctor wants to draft consultation notes
   - draftReferral: Doctor wants to draft a referral
   - draftFollowupNotes: Doctor wants to draft follow-up notes

2. Extract parameters relevant to the intent

Return ONLY valid JSON:
{
  "intent": "viewMyAppointments" | "viewMySchedule" | "viewAssignedPatients" | "summarizePatientHistory" | "draftConsultationNotes" | "draftReferral" | "draftFollowupNotes",
  "type": "schedule" | "patient" | "draft" | "summary",
  "parameters": {
    "patientName": string | null,
    "patientID": string | null,
    "dateRange": "today" | "week" | "month" | null,
    "documentType": "consultation" | "referral" | "followup" | null
  },
  "summary": "Brief explanation of what the doctor is asking for"
}`,

    NURSE: `You are a patient care workflow assistant for nurses.

Your job is to:
1. Classify the user's intent into one of these categories:
   - showWaitingPatients: Nurse wants to see waiting patients
   - showTodaysQueue: Nurse wants to see today's patient queue
   - searchPatient: Nurse is looking for a specific patient
   - bookAppointment: Nurse wants to book an appointment
   - rescheduleAppointment: Nurse wants to reschedule an appointment
   - cancelAppointment: Nurse wants to cancel an appointment
   - checkInPatient: Nurse is checking in a patient
   - recordVitals: Nurse is recording patient vitals
   - assistVitalsWorkflow: Nurse needs help with vitals workflow

2. Extract parameters relevant to the intent

Return ONLY valid JSON:
{
  "intent": "showWaitingPatients" | "showTodaysQueue" | "searchPatient" | "bookAppointment" | "rescheduleAppointment" | "cancelAppointment" | "checkInPatient" | "recordVitals" | "assistVitalsWorkflow",
  "type": "queue" | "search" | "appointment" | "checkin" | "vitals",
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
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

        if (!apiKey || !endpoint) {
            console.error("Missing Azure OpenAI Credentials");
            return NextResponse.json(
                { error: "Configuration Error" },
                { status: 500 }
            );
        }

        const client = new AzureOpenAI({
            endpoint,
            apiKey,
            apiVersion: "2024-05-01-preview",
            deployment: deploymentName,
        });
        const session = await getServerSession();
        const userRole = session?.user?.role || 'DOCTOR';
        const { text, context } = await req.json();
        const role = context || userRole;

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
                content: `Extract from: "${text}"`
            }
        ];

        const result = await client.chat.completions.create({
            messages,
            model: "",
            response_format: { type: "json_object" }
        });

        const aiResponse = JSON.parse(result.choices[0].message.content);
        return NextResponse.json({
            ...aiResponse,
            context: role,
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