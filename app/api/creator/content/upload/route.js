import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com/api';

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
    let formData;
    try {
      formData = await request.formData();
    } catch (formDataError) {
      console.error("Error parsing form data:", formDataError);
      return NextResponse.json(
        {
          status: false,
          code: 400,
          message: "Invalid form data",
          error: formDataError.message,
        },
        { status: 400 }
      );
    }

    // Validate required fields
    const video = formData.get("video");
    const teaser = formData.get("teaser");
    const title = formData.get("title");

    if (!video || !teaser || !title) {
      return NextResponse.json(
        {
          status: false,
          code: 400,
          message: "Missing required fields: video, teaser, and title are required",
        },
        { status: 400 }
      );
    }

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
      let errorText;
      let errorData;
      
      try {
        errorText = await response.text();
        // Try to parse as JSON
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // If not JSON, create error object from text
          errorData = {
            status: false,
            code: response.status,
            message: errorText || "Failed to upload content",
            error: errorText || "Could not read error response",
          };
        }
      } catch (readError) {
        console.error("Error reading error response:", readError);
        errorData = {
          status: false,
          code: response.status,
          message: `Upload failed with status ${response.status}`,
          error: "Could not read error response",
        };
      }

      console.error("Upload API error:", errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    // Parse successful response
    let data;
    try {
      const responseText = await response.text();
      if (responseText) {
        data = JSON.parse(responseText);
      } else {
        data = { status: true, message: "Upload successful" };
      }
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      return NextResponse.json(
        {
          status: false,
          code: 500,
          message: "Failed to parse server response",
          error: parseError.message,
        },
        { status: 500 }
      );
    }

    // Return the response as-is from the external API
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/creator/content/upload:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        status: false,
        code: 500,
        message: "Internal server error",
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
