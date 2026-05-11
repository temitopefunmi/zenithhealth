import { NextResponse } from 'next/server';

/**
 * POST /api/scheduler/validate
 *
 * This route acts as a server-side bridge between the dashboard UI
 * and the Azure Scheduler Function.
 *
 * Why not call the Function directly from the browser?
 * - Keeps the frontend simpler
 * - Avoids exposing infrastructure details directly in client code
 * - Gives us one place to add auth/RBAC later
 */
export async function POST(request) {
    try {
        const body = await request.json();

        const baseUrl = process.env.SCHEDULER_FUNCTION_BASE_URL;

        if (!baseUrl) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Scheduler Function URL is not configured.'
                },
                { status: 500 }
            );
        }

        const functionUrl = `${baseUrl}/api/validate-schedule`;

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Scheduler validation error:', error);

        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to validate appointment schedule.'
            },
            { status: 500 }
        );
    }
}