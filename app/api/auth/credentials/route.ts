import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/credentials
 * Returns authentication credentials for client-side use
 * This allows the client to make direct API calls to the backend
 * while bypassing Vercel's payload size limits
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const uuid = cookieStore.get("uuid")?.value;
    const auth_token = cookieStore.get("auth_token")?.value;
    const is_creator = cookieStore.get("is_creator")?.value;

    if (!uuid || !auth_token) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      uuid,
      auth_token,
      is_creator: is_creator === "1",
    });
  } catch (error: unknown) {
    console.error("Error getting credentials:", error);
    return NextResponse.json(
      {
        authenticated: false,
        message: "Failed to get credentials",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
