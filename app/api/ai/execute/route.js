import { NextResponse } from "next/server";
import { executeIntent } from "@/lib/ai/intent-executor";
import { ALLOWED_INTENTS } from "@/lib/ai/intent-permissions";
import { auth } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await auth();
    const body = await req.json();
    const role = session?.user?.role;

    if (!role || !ALLOWED_INTENTS[role]?.includes(body.intent)) {
      return NextResponse.json(
        { error: "You are not authorized to perform this action." },
        { status: 403 }
      );
    }

    const result = await executeIntent({
      ...body,
      session,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to execute intent" },
      { status: 500 }
    );
  }
}