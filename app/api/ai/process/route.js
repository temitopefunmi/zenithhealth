import { AzureOpenAI } from "openai";
import { NextResponse } from 'next/server';

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

const client = new AzureOpenAI({
    endpoint: endpoint,
    apiKey: apiKey,
    apiVersion: "2024-05-01-preview", // Standard API version for GPT-4o
    deployment: deploymentName,
});

export async function POST(req) {
    try {
        const { text } = await req.json();
        
        // Get actual date for relative calculations (tomorrow, next week, etc.)
        const currentDateTime = new Date().toISOString();

        const messages = [
            { 
                role: "system", 
                content: `You are a clinical administrative assistant. Today's date is ${currentDateTime}. Extract appointment details into JSON. Convert relative dates (like 'tomorrow' or 'next Tuesday') into absolute ISO 8601 strings.` 
            },
            { 
                role: "user", 
                content: `Extract the following details from this request: "${text}". 
                
                Return ONLY a JSON object with these EXACT keys:
                - patientName
                - doctor
                - appointmentDate (ISO 8601 format)
                - priority (Low, Medium, High, Urgent)
                - reasoning (A brief clinical justification for the priority)
                
                If a year isn't specified, assume the current or upcoming year.` 
            }
        ];

        const result = await client.chat.completions.create({
            messages: messages,
            model: "", // Leave empty for Azure as it uses the 'deployment' from constructor
            response_format: { type: "json_object" }
        });
        const aiResponse = JSON.parse(result.choices[0].message.content);
        
        // Return the structured data to the AICommandBar.js
        return NextResponse.json(aiResponse);
        
    } catch (error) {
        console.error("Azure OpenAI Error:", error);
        return NextResponse.json({ error: "Azure AI failed to process request" }, { status: 500 });
    }
}