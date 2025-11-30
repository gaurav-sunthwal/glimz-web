import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = "http://api.glimznow.com/api";

export async function GET() {
  try {
    // Get UUID and auth token from cookies
    const cookieStore = cookies();
    const uuid = cookieStore.get("uuid")?.value;
    const auth_token = cookieStore.get("auth_token")?.value;

    console.log("Fetching creator details for creator:", { uuid, auth_token });

    // Check if UUID exists
    if (!uuid) {
      console.warn("No UUID found in cookies");
      return NextResponse.json(
        {
          status: false,
          error: "Authentication required",
          message: "User is not Registered",
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
          message: "User is not Registered",
        },
        { status: 401 }
      );
    }

    // Fetch from creator endpoint
    console.log("Making request to creator endpoint:", {
      url: `${API_BASE_URL}/creator/getDetail`,
      uuid: uuid,
    });

    try {
      const response = await fetch(`${API_BASE_URL}/creator/getDetail`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "uuid": uuid,
          "auth_token": auth_token,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Check if we got valid creator details - handle both response formats
        const creatorDetail = data?.creatorDetail || data?.CreatorDetail || data?.data;
        if (data && data.status && creatorDetail) {
          console.log("✅ Successfully fetched creator details from creator endpoint");
          return NextResponse.json({
            status: true,
            data: creatorDetail, // Match React Native format: response.data
            creatorDetail: creatorDetail, // Also include for backward compatibility
            isCreator: true,
          });
        }

        // If API says not registered, creator needs to complete profile
        const messageText = (data?.message || "").toLowerCase();
        if (data?.status && !data?.creatorDetail && messageText.includes('not registered')) {
          return NextResponse.json({
            status: false,
            needsProfileSetup: true,
            preferredType: 'creator',
          }, { status: 404 });
        }
      }
    } catch (error) {
      console.log("Creator endpoint failed:", error);
    }

    // If creator endpoint failed, creator needs profile setup
    console.log("Creator endpoint failed, creator needs profile setup");
    return NextResponse.json(
      {
        status: false,
        error: "Profile incomplete",
        message: "Creator needs to complete profile setup",
        needsProfileSetup: true,
      },
      { status: 404 }
    );

  } catch (error) {
    console.error("Error in GET /api/user/get-creator-details:", error);
    return NextResponse.json(
      {
        status: false,
        error: "Internal server error",
        message: "An unexpected error occurred while fetching creator details",
      },
      { status: 500 }
    );
  }
}
