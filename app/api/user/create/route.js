import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com/api';

// GET handler: method not supported
export async function GET() {
  return NextResponse.json(
    { error: "Method not supported. Please use POST to create a user." },
    { status: 405 }
  );
}

export async function POST(request) {
  try {
    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body", parseError: parseError.message },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      username,
      userType = "user",
      youtubeChannelName,
      youtubeChannelLink,
      subscribers,
      contentLength,
    } = requestData || {};

    // Validate required fields
    if (!firstName || !lastName || !email || !username) {
      return NextResponse.json(
        {
          error:
            "All fields are required (firstName, lastName, email, username)",
        },
        { status: 400 }
      );
    }

    // Read cookies
    let authToken = null;
    let uuid = null;
    try {
      const cookieStore = await cookies();
      const authTokenCookie = cookieStore.get("auth_token");
      const uuidCookie = cookieStore.get("uuid");
      authToken = authTokenCookie ? authTokenCookie.value : null;
      uuid = uuidCookie ? uuidCookie.value : null;
    } catch (cookieError) {
      return NextResponse.json(
        { error: "Failed to read cookies", details: cookieError.message },
        { status: 500 }
      );
    }

    if (!authToken || !uuid) {
      return NextResponse.json(
        {
          error:
            "Authentication required - missing auth_token or uuid cookies",
        },
        { status: 401 }
      );
    }

    // Choose endpoint: /viewer/create for user, /creator/create for creator
    const apiEndpoint =
      userType && userType === "creator"
        ? "creator/create"
        : "viewer/create";

    // Prepare fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response;
    try {
      response = await fetch(`${API_BASE_URL}/${apiEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          auth_token: authToken,
          uuid: uuid,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          username: username,
          ...(userType === "creator"
            ? {
                channel_name: youtubeChannelName,
                channel_link: youtubeChannelLink,
                subscribers: subscribers,
                content_length: contentLength,
              }
            : {}),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timeout - external API did not respond" },
          { status: 504 }
        );
      }
      return NextResponse.json(
        {
          error: "Failed to connect to external API",
          details: fetchError.message,
        },
        { status: 503 }
      );
    }

    // Handle non-ok response
    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = "Could not read error response";
        console.log("Could not read error response", e)
      }
      return NextResponse.json(
        {
          error: "External API error",
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      );
    }

    // Parse response
    let data;
    try {
      const responseText = await response.text();
      if (!responseText) {
        return NextResponse.json(
          { error: "Empty response from external API" },
          { status: 502 }
        );
      }
      data = JSON.parse(responseText);
    } catch (jsonError) {
      return NextResponse.json(
        { error: "Invalid JSON response from external API" , jsonError },
        { status: 502 }
      );
    }

    // Return result
    if (data && data.status === true) {
      // Set is_creator cookie based on userType
      const response = NextResponse.json({
        status: true,
        message: data.message || "User created successfully",
        data: data.data || null,
      });

      // Set is_creator cookie: '1' for creator, '0' for regular user
      const isCreatorValue = userType === 'creator' ? '1' : '0';
      response.cookies.set('is_creator', isCreatorValue, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      console.log(`User created successfully. Set is_creator cookie to: ${isCreatorValue} for userType: ${userType}`);
      return response;
    } else {
      return NextResponse.json(
        {
          status: false,
          message: (data && data.message) || "Failed to create user",
          error: (data && data.error) || null,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          typeof process !== "undefined" &&
          process.env &&
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}