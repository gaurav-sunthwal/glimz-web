import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = "http://api.glimznow.com/api";

export async function GET(request) {
  try {
    // Get UUID and auth token from cookies
    const cookieStore = cookies();
    const uuid = cookieStore.get("uuid")?.value;
    const auth_token = cookieStore.get("auth_token")?.value;

    console.log("Fetching content list:", { uuid, auth_token });

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

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    // Build query string
    const queryParams = new URLSearchParams({
      page: page,
      limit: limit,
    });

    // Call external API
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/content?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "uuid": uuid,
          "auth_token": auth_token,
        },
      });
    } catch (fetchError) {
      console.error("Error calling content API:", fetchError);
      return NextResponse.json(
        {
          status: false,
          code: 503,
          message: "Failed to connect to content service",
          error: fetchError.message,
        },
        { status: 503 }
      );
    }

    console.log("Content API response status:", response.status);

    // Handle non-ok response
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          status: false,
          code: response.status,
          message: "Failed to fetch content",
          error: "Could not read error response",
        };
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    // Parse successful response
    const data = await response.json();
    console.log("Content API response data:", data);

    // Return the response as-is from the external API
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/content:", error);
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

