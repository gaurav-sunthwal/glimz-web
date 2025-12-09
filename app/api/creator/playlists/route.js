import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com/api';

export async function GET() {
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
          message: "Only creators can access playlists",
        },
        { status: 403 }
      );
    }

    // Build headers with authentication
    const headers = {
      uuid: uuid,
      auth_token: auth_token,
      "Content-Type": "application/json",
    };

    // Call external API
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/creator/playlists`, {
        method: "GET",
        headers: headers,
      });
    } catch (fetchError) {
      console.error("Error calling playlists API:", fetchError);
      return NextResponse.json(
        {
          status: false,
          code: 503,
          message: "Failed to connect to playlists service",
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
          message: "Failed to fetch playlists",
          error: "Could not read error response",
        };
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    // Parse successful response
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/creator/playlists:", error);
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
          message: "Only creators can create playlists",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Build headers with authentication
    const headers = {
      uuid: uuid,
      auth_token: auth_token,
      "Content-Type": "application/json",
    };

    // Call external API
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/creator/playlists`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });
    } catch (fetchError) {
      console.error("Error calling create playlist API:", fetchError);
      return NextResponse.json(
        {
          status: false,
          code: 503,
          message: "Failed to connect to playlists service",
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
          message: "Failed to create playlist",
          error: "Could not read error response",
        };
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    // Parse successful response
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/creator/playlists:", error);
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
