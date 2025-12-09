import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com/api';

export async function GET(request) {
  try {
    // Get UUID and auth token from cookies (optional for trending content)
    const cookieStore = cookies();
    const uuid = cookieStore.get("uuid")?.value;
    const auth_token = cookieStore.get("auth_token")?.value;

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    // Build query string
    const queryParams = new URLSearchParams({
      page: page,
      limit: limit,
    });

    // Build headers - only include auth if available
    const headers = {
      "Content-Type": "application/json",
    };
    
    // Add auth headers only if they exist (for trending content, auth is not required)
    if (uuid) {
      headers["uuid"] = uuid;
    }
    if (auth_token) {
      headers["auth_token"] = auth_token;
    }

    // Call external API
    let response;
    const apiUrl = `${API_BASE_URL}/content?${queryParams.toString()}`;
    console.log('[Content API] Calling:', apiUrl);
    console.log('[Content API] Headers:', headers);
    
    try {
      response = await fetch(apiUrl, {
        method: "GET",
        headers: headers,
      });
      
      console.log('[Content API] Response status:', response.status);
      console.log('[Content API] Response ok:', response.ok);
    } catch (fetchError) {
      console.error("[Content API] Fetch error:", fetchError);
      return NextResponse.json(
        {
          status: false,
          code: 503,
          message: "Failed to connect to content service",
          error: fetchError.message,
          apiUrl: apiUrl,
        },
        { status: 503 }
      );
    }

    // Handle non-ok response
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('[Content API] Error response:', errorData);
      } catch {
        errorData = {
          status: false,
          code: response.status,
          message: "Failed to fetch content",
          error: "Could not read error response",
          apiUrl: apiUrl,
        };
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    // Parse successful response
    const data = await response.json();

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

