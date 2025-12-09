import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://api.glimznow.com/api";

export async function GET() {
  try {
    // Get UUID and auth token from cookies
    const cookieStore = await cookies();
    const uuid = cookieStore.get("uuid")?.value;
    const auth_token = cookieStore.get("auth_token")?.value;

    // Check if UUID exists
    if (!uuid) {
      console.warn("No UUID found in cookies");
      return NextResponse.json(
        {
          status: false,
          code: 401,
          message: "Authentication required",
          error: "User is not authenticated",
        },
        { status: 401 }
      );
    }

    // Check if auth token exists
    if (!auth_token) {
      console.warn("No authentication token found in cookies");
      return NextResponse.json(
        {
          status: false,
          code: 401,
          message: "Authentication required",
          error: "User is not authenticated",
        },
        { status: 401 }
      );
    }

    // Fetch purchased content list from external API
    try {
      const response = await fetch(`${API_BASE_URL}/user/purchased-content`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          uuid: uuid,
          auth_token: auth_token,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Return the response as-is from the external API
        return NextResponse.json(data, { status: 200 });
      } else {
        // Handle non-ok response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            status: false,
            code: response.status,
            message: "Failed to fetch purchased content list",
            error: "Could not read error response",
          };
        }

        return NextResponse.json(errorData, { status: response.status });
      }
    } catch (fetchError) {
      console.error("Error calling purchased content API:", fetchError);
      return NextResponse.json(
        {
          status: false,
          code: 503,
          message: "Failed to connect to purchased content service",
          error: fetchError.message,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Error in GET /api/user/purchased-content:", error);
    return NextResponse.json(
      {
        status: false,
        code: 500,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
