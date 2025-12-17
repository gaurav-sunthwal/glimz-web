import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com/api';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const uuid = cookieStore.get("uuid")?.value;
    const auth_token = cookieStore.get("auth_token")?.value;
    const is_creator = cookieStore.get("is_creator")?.value;

    console.log("🔐 [Playlists API] Authentication details:", {
      uuid: uuid ? `${uuid.substring(0, 8)}...` : "MISSING",
      auth_token: auth_token ? `${auth_token.substring(0, 10)}...` : "MISSING",
      is_creator: is_creator,
    });

    // Check if user is authenticated and is a creator
    if (!uuid || !auth_token) {
      console.error("❌ [Playlists API] Authentication missing");
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
      console.error("❌ [Playlists API] User is not a creator:", is_creator);
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

    // Step 1: First get creator details to extract creator_id
    console.log("📤 [Playlists API] Fetching creator details first...");
    let creatorResponse;
    try {
      creatorResponse = await fetch(`${API_BASE_URL}/creator/getDetail`, {
        method: "GET",
        headers: headers,
      });

      console.log("📥 [Playlists API] Creator details response:", {
        status: creatorResponse.status,
        statusText: creatorResponse.statusText,
        ok: creatorResponse.ok,
      });
    } catch (fetchError) {
      console.error("❌ [Playlists API] Error calling creator details API:", fetchError);
      return NextResponse.json(
        {
          status: false,
          code: 503,
          message: "Failed to connect to creator service",
          error: fetchError.message,
        },
        { status: 503 }
      );
    }

    if (!creatorResponse.ok) {
      let errorText;
      let errorData;

      try {
        errorText = await creatorResponse.text();
        console.log("📄 [Playlists API] Creator details error response:", errorText);

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            status: false,
            code: creatorResponse.status,
            message: errorText || "Failed to fetch creator details",
            error: errorText || "Could not read error response",
          };
        }
      } catch (readError) {
        console.error("Error reading error response:", readError);
        errorData = {
          status: false,
          code: creatorResponse.status,
          message: `Fetch failed with status ${creatorResponse.status}`,
          error: "Could not read error response",
        };
      }

      console.error("❌ [Playlists API] Creator details error:", errorData);
      return NextResponse.json(errorData, { status: creatorResponse.status });
    }

    // Parse creator details response
    let creatorData;
    try {
      const responseText = await creatorResponse.text();
      console.log("📄 [Playlists API] Creator details text:", responseText.substring(0, 200));

      if (responseText) {
        creatorData = JSON.parse(responseText);
      } else {
        return NextResponse.json(
          {
            status: false,
            code: 404,
            message: "No creator details found",
          },
          { status: 404 }
        );
      }
    } catch (parseError) {
      console.error("❌ [Playlists API] Error parsing creator details:", parseError);
      return NextResponse.json(
        {
          status: false,
          code: 500,
          message: "Failed to parse creator details response",
          error: parseError.message,
        },
        { status: 500 }
      );
    }

    // Extract creator_id from creatorDetail
    const creatorId = creatorData?.creatorDetail?.creator_id;
    console.log("🆔 [Playlists API] Extracted creator ID:", creatorId);

    if (!creatorId) {
      console.error("❌ [Playlists API] Creator ID not found in response");
      return NextResponse.json(
        {
          status: false,
          code: 404,
          message: "Creator ID not found",
        },
        { status: 404 }
      );
    }

    // Step 2: Now fetch playlists with the creator_id
    console.log("📤 [Playlists API] Calling external API with creator_id:", {
      url: `${API_BASE_URL}/creator/playlists?creator_id=${creatorId}`,
      method: "GET",
    });

    // Call external API
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/creator/playlists?creator_id=${creatorId}`, {
        method: "GET",
        headers: headers,
      });

      console.log("📥 [Playlists API] External API response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });
    } catch (fetchError) {
      console.error("❌ [Playlists API] Error calling playlists API:", fetchError);
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
      let errorText;
      let errorData;

      try {
        errorText = await response.text();
        console.log("📄 [Playlists API] Error response text:", errorText);

        // Try to parse as JSON
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // If not JSON, create error object from text
          errorData = {
            status: false,
            code: response.status,
            message: errorText || "Failed to fetch playlists",
            error: errorText || "Could not read error response",
          };
        }
      } catch (readError) {
        console.error("Error reading error response:", readError);
        errorData = {
          status: false,
          code: response.status,
          message: `Fetch failed with status ${response.status}`,
          error: "Could not read error response",
        };
      }

      console.error("❌ [Playlists API] Error data:", errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    // Parse successful response
    let data;
    try {
      const responseText = await response.text();
      console.log("📄 [Playlists API] Response text:", responseText.substring(0, 200));

      if (responseText) {
        data = JSON.parse(responseText);
      } else {
        data = { status: true, message: "No playlists found", data: [] };
      }
    } catch (parseError) {
      console.error("❌ [Playlists API] Error parsing response:", parseError);
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

    console.log("✅ [Playlists API] Success:", {
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ [Playlists API] Error in GET /api/creator/playlists:", error);
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

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const uuid = cookieStore.get("uuid")?.value;
    const auth_token = cookieStore.get("auth_token")?.value;
    const is_creator = cookieStore.get("is_creator")?.value;

    console.log("🔐 [Create Playlist API] Authentication details:", {
      uuid: uuid ? `${uuid.substring(0, 8)}...` : "MISSING",
      auth_token: auth_token ? `${auth_token.substring(0, 10)}...` : "MISSING",
      is_creator: is_creator,
    });

    // Check if user is authenticated and is a creator
    if (!uuid || !auth_token) {
      console.error("❌ [Create Playlist API] Authentication missing");
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
      console.error("❌ [Create Playlist API] User is not a creator:", is_creator);
      return NextResponse.json(
        {
          status: false,
          code: 403,
          message: "Only creators can create playlists",
        },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log("📦 [Create Playlist API] Request body:", body);
    } catch (parseError) {
      console.error("❌ [Create Playlist API] Error parsing request body:", parseError);
      return NextResponse.json(
        {
          status: false,
          code: 400,
          message: "Invalid request body",
          error: parseError.message,
        },
        { status: 400 }
      );
    }

    // Build headers with authentication
    const headers = {
      uuid: uuid,
      auth_token: auth_token,
      "Content-Type": "application/json",
    };

    console.log("📤 [Create Playlist API] Calling external API:", {
      url: `${API_BASE_URL}/creator/playlists`,
      method: "POST",
      body: body,
    });

    // Call external API
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/creator/playlists`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      console.log("📥 [Create Playlist API] External API response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });
    } catch (fetchError) {
      console.error("❌ [Create Playlist API] Error calling create playlist API:", fetchError);
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
      let errorText;
      let errorData;

      try {
        errorText = await response.text();
        console.log("📄 [Create Playlist API] Error response text:", errorText);

        // Try to parse as JSON
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // If not JSON, create error object from text
          errorData = {
            status: false,
            code: response.status,
            message: errorText || "Failed to create playlist",
            error: errorText || "Could not read error response",
          };
        }
      } catch (readError) {
        console.error("Error reading error response:", readError);
        errorData = {
          status: false,
          code: response.status,
          message: `Create failed with status ${response.status}`,
          error: "Could not read error response",
        };
      }

      console.error("❌ [Create Playlist API] Error data:", errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    // Parse successful response
    let data;
    try {
      const responseText = await response.text();
      console.log("📄 [Create Playlist API] Response text:", responseText.substring(0, 200));

      if (responseText) {
        data = JSON.parse(responseText);
      } else {
        data = { status: true, message: "Playlist created successfully" };
      }
    } catch (parseError) {
      console.error("❌ [Create Playlist API] Error parsing response:", parseError);
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

    console.log("✅ [Create Playlist API] Success:", {
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ [Create Playlist API] Error in POST /api/creator/playlists:", error);
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
