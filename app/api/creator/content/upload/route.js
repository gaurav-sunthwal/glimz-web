import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = "http://api.glimznow.com/api";

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const uuid = cookieStore.get("uuid")?.value;
    const auth_token = cookieStore.get("auth_token")?.value;
    const is_creator = cookieStore.get("is_creator")?.value;

    // Check if user is authenticated and is a creator
    if (!uuid || !auth_token) {
      return NextResponse.json(
        {
          status: false,
          code: 401,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    if (is_creator !== "1") {
      return NextResponse.json(
        {
          status: false,
          code: 403,
          message: "Only creators can upload content",
        },
        { status: 403 }
      );
    }

    // Get FormData from request
    const formData = await request.formData();

    // Build headers with authentication
    const headers = {
      uuid: uuid,
      auth_token: auth_token,
    };

    // Call external API
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/creator/content/upload`, {
        method: "POST",
        headers: headers,
        body: formData,
      });
    } catch (fetchError) {
      console.error("Error calling upload API:", fetchError);
      return NextResponse.json(
        {
          status: false,
          code: 503,
          message: "Failed to connect to upload service",
          error: fetchError.message,
        },
        { status: 503 }
      );
    }

    // Handle non-ok response
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          status: false,
          code: response.status,
          message: "Failed to upload content",
          error: "Could not read error response",
        };
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    // Parse successful response
    const data = await response.json();

    // Return the response as-is from the external API
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/creator/content/upload:", error);
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
