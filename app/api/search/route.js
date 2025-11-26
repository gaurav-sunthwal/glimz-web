import { NextResponse } from "next/server";

const API_BASE_URL = "http://api.glimznow.com/api";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "all";
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    // Validate required query parameter
    if (!query || query.trim() === "") {
      return NextResponse.json(
        {
          status: false,
          code: 400,
          message: "Search query (q) is required",
          error: "Missing required parameter: q",
        },
        { status: 400 }
      );
    }

    // Build query string
    const queryParams = new URLSearchParams({
      q: query.trim(),
      type: type,
      page: page,
      limit: limit,
    });

    // Call external API
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/search?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (fetchError) {
      console.error("Error calling search API:", fetchError);
      return NextResponse.json(
        {
          status: false,
          code: 503,
          message: "Failed to connect to search service",
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
      } catch (e) {
        errorData = {
          status: false,
          code: response.status,
          message: "Search service error",
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
    console.error("Error in search route:", error);
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

