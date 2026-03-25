import { AzureOpenAI } from "openai";
import { NextResponse } from 'next/server';

// 1. Tell Next.js this MUST be a server-side runtime (fixes "Collecting page data" error)
export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        // 2. Move initialization INSIDE the POST function
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

        // Safety check for production logs
        if (!apiKey || !endpoint) {
            console.error("Missing Azure OpenAI Credentials");
            return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
        }

        const client = new AzureOpenAI({
            endpoint: endpoint,
            apiKey: apiKey,
            apiVersion: "2024-05-01-preview", 
            deployment: deploymentName,
        });

        const { text } = await req.json();
        const currentDateTime = new Date().toISOString();

        const messages = [
            { 
                role: "system", 
                content: `You are a clinical administrative assistant. Today's date is ${currentDateTime}. Extract appointment details into JSON. Convert relative dates into absolute ISO 8601 strings.` 
            },
            { 
                role: "user", 
                content: `Extract from: "${text}". 
                Return ONLY a JSON object with: patientName, doctor, appointmentDate (ISO 8601), priority (Low, Medium, High, Urgent), reasoning.` 
            }
        ];

        const result = await client.chat.completions.create({
            messages: messages,
            model: "", 
            response_format: { type: "json_object" }
        });

        const aiResponse = JSON.parse(result.choices[0].message.content);
        return NextResponse.json(aiResponse);
        
    } catch (error) {
        console.error("Azure OpenAI Error:", error);
        return NextResponse.json({ error: "Azure AI failed to process request" }, { status: 500 });
    }
}