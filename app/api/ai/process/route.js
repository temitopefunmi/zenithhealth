import { AzureOpenAI } from "openai";
import { NextResponse } from 'next/server';

// Force this route to run dynamically on the server
export const dynamic = 'force-dynamic';

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

        const { text } = await req.json();

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

        const messages = [
            {
                role: "system",
                content: `
You are a clinical administrative assistant.

Current local date and time in Nigeria (Africa/Lagos) is: ${nigeriaNow}.

Your job is to extract appointment details from the user's message.

Rules:
1. Interpret relative time expressions like "tomorrow", "next week", "this afternoon", or "2pm" using Africa/Lagos timezone.
2. if the user provides a date without a time (e.g., "next Monday"), default the time to 09:00:00 Africa/Lagos time.
3. Return appointmentDate as a full ISO 8601 timestamp. For example, "next Monday" would become "2024-06-17T09:00:00+01:00" (assuming next Monday is June 17th, 2024).
4. If the user does not provide any date or time at all, set appointmentDate to null.
5. Return ONLY valid JSON.
Extract 'notes': This should be the REMAINING text after removing patient name, doctor, date/time, and priority.
Return this exact shape:
Extract 'reasoning': This should be a brief explanation of WHY you chose the priority based on the user's input.
{
  "patientName": string | null,
  "doctor": string | null,
  "appointmentDate": string | null,
  "priority": "Low" | "Medium" | "High" | "Urgent",
  "reasoning": string
}
                `.trim()
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
        return NextResponse.json(aiResponse);

    } catch (error) {
        console.error("Azure OpenAI Error:", error);
        return NextResponse.json(
            { error: "Azure AI failed to process request" },
            { status: 500 }
        );
    }
}