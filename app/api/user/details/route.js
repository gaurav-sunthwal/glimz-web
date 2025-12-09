import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://api.glimznow.com/api";

// Helper function to try both endpoints as fallback
async function tryBothEndpoints(uuid, auth_token) {
  let response;
  let data;

  // First try viewer endpoint
  console.log("Trying viewer endpoint as fallback");
  try {
    response = await fetch(`${API_BASE_URL}/viewer/getDetail`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        uuid: uuid,
        auth_token: auth_token,
      },
    });

    if (response.ok) {
      data = await response.json();
      if (data && data.status && data.ViewerDetail) {
        return NextResponse.json({
          status: true,
          ViewerDetail: data.ViewerDetail,
          isCreator: false,
        });
      }
    }
  } catch (error) {
    console.log("Viewer endpoint failed in fallback:", error);
  }

  // Then try creator endpoint
  console.log("Trying creator endpoint as fallback");
  try {
    response = await fetch(`${API_BASE_URL}/creator/getDetail`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        uuid: uuid,
        auth_token: auth_token,
      },
    });

    if (response.ok) {
      data = await response.json();
      if (
        data &&
        data.status &&
        (data.creatorDetail || data.CreatorDetail || data.ViewerDetail)
      ) {
        return NextResponse.json({
          status: true,
          ViewerDetail:
            data.creatorDetail || data.CreatorDetail || data.ViewerDetail,
          isCreator: true,
        });
      }
    }
  } catch (error) {
    console.log("Creator endpoint failed in fallback:", error);
  }

  // If both endpoints failed, user needs profile setup
  return NextResponse.json(
    {
      status: false,
      error: "Profile incomplete",
      message: "User needs to complete profile setup",
      needsProfileSetup: true,
    },
    { status: 404 }
  );
}

export async function GET() {
  try {
    // Get UUID, auth token, and is_creator status from cookies
    const cookieStore = await cookies();
    const uuid = cookieStore.get("uuid")?.value;
    const auth_token = cookieStore.get("auth_token")?.value;
    const is_creator_cookie = cookieStore.get("is_creator")?.value;

    // Debug: Log cookies for troubleshooting
    console.log("Fetched cookies:", { uuid, auth_token, is_creator_cookie });

    // Check if UUID exists
    if (!uuid) {
      console.warn("No UUID found in cookies");
      return NextResponse.json(
        {
          status: false,
          error: "Authentication required",
          message: "Viewer is not Registered",
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
          error: "Authentication required",
          message: "Viewer is not Registered",
        },
        { status: 401 }
      );
    }

    // Determine which endpoint to use based on is_creator status
    const isCreator = is_creator_cookie === "1";
    const isUser = is_creator_cookie === "0";
    const isNull = is_creator_cookie === "null" || !is_creator_cookie;

    console.log("User type determination:", {
      isCreator,
      isUser,
      isNull,
      is_creator_cookie,
    });

    let response;
    let data;
    let apiEndpoint;
    let userType;

    // Determine endpoint and user type based on is_creator status
    if (isCreator) {
      // User is a creator, fetch from creator endpoint
      apiEndpoint = `${API_BASE_URL}/creator/getDetail`;
      userType = "creator";
      console.log("✅ User is CREATOR - will fetch from creator endpoint");
    } else if (isUser) {
      // User is a regular user, fetch from viewer endpoint
      apiEndpoint = `${API_BASE_URL}/viewer/getDetail`;
      userType = "user";
      console.log("✅ User is REGULAR USER - will fetch from viewer endpoint");
    } else if (isNull) {
      // User hasn't completed signup, needs profile setup
      console.log(
        "❌ User needs to complete profile setup - is_creator is null"
      );
      return NextResponse.json(
        {
          status: false,
          error: "Profile incomplete",
          message: "User needs to complete profile setup",
          needsProfileSetup: true,
        },
        { status: 404 }
      );
    } else {
      // Fallback: try both endpoints
      console.log("⚠️ Unknown is_creator status, trying both endpoints");
      return await tryBothEndpoints(uuid, auth_token);
    }

    // Make request to the determined endpoint
    console.log(`Making request to ${userType} endpoint:`, {
      url: apiEndpoint,
      uuid: uuid,
    });

    try {
      response = await fetch(apiEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          uuid: uuid,
          auth_token: auth_token,
        },
      });

      if (response.ok) {
        data = await response.json();

        // Check if we got valid user details
        const userDetail =
          data?.creatorDetail || data?.CreatorDetail || data?.ViewerDetail;
        if (data && data.status && userDetail) {
          return NextResponse.json({
            status: true,
            ViewerDetail: userDetail,
            isCreator: isCreator,
          });
        }

        // If API says not registered, user needs to complete profile
        const messageText = (data?.message || "").toLowerCase();
        if (
          data?.status &&
          !userDetail &&
          messageText.includes("not registered")
        ) {
          return NextResponse.json(
            {
              status: false,
              needsProfileSetup: true,
              preferredType: userType,
            },
            { status: 404 }
          );
        }
      }
    } catch (error) {
      console.log(`${userType} endpoint failed:`, error);
    }

    // If the determined endpoint failed, try the fallback approach
    console.log(`${userType} endpoint failed, trying fallback approach`);
    return await tryBothEndpoints(uuid, auth_token);
  } catch (error) {
    // Log the actual error for debugging
    console.error("Error in GET /api/user/details:", error);

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
