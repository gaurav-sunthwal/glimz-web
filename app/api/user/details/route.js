import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = "http://api.glimznow.com/api";

export async function GET() {
  try {
    // Get UUID and auth token from cookies
    const cookieStore = cookies();
    const uuid = cookieStore.get("uuid")?.value;
    const auth_token = cookieStore.get("auth_token")?.value;

    // Check if UUID exists
    if (!uuid) {
      return NextResponse.json(
        {
          status: false,
          error: "Authentication required",
          message: "No UUID found in cookies",
        },
        { status: 401 }
      );
    }

    // Check if auth token exists
    if (!auth_token) {
      return NextResponse.json(
        {
          status: false,
          error: "Authentication required",
          message: "No authentication token found",
        },
        { status: 401 }
      );
    }

    // Make API request to get viewer details
    const response = await fetch(`${API_BASE_URL}/viewer/getDetail`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "uuid": uuid,
        "auth_token": auth_token,
      },
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          status: false,
          error: "API request failed",
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    // Parse response data
    const data = await response.json();

    // Check if the API returned a successful status
    if (data.status) {
      return NextResponse.json({
        status: true,
        ViewerDetail: data.ViewerDetail,
      });
    } else {
      return NextResponse.json(
        {
          status: false,
          error: "API error",
          message: data.message || "Failed to fetch viewer details",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    // Log the actual error for debugging
    console.error("Error in GET /api/viewer/details:", error);

    // Return a generic error response
    return NextResponse.json(
      {
        status: false,
        error: "Internal server error",
        message: "An unexpected error occurred while fetching viewer details",
      },
      { status: 500 }
    );
  }
}