import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = "http://api.glimznow.com/api";

export async function GET() {
  try {
    // Get UUID and auth token from cookies
    const cookieStore = cookies();
    const uuid = cookieStore.get("uuid")?.value;
    const auth_token = cookieStore.get("auth_token")?.value;

    // Debug: Log cookies for troubleshooting
    console.log("Fetched cookies:", { uuid, auth_token });

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

    // Try to get user details - first try viewer endpoint, then creator endpoint
    let response;
    let data;

    // First try viewer endpoint
    console.log("Making request to external API for viewer details", {
      url: `${API_BASE_URL}/viewer/getDetail`,
      uuid: uuid,
    });

    try {
      response = await fetch(`${API_BASE_URL}/viewer/getDetail`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "uuid": uuid,
          "auth_token": auth_token,
        },
      });

      console.log("Viewer API response status:", response.status);

      if (response.ok) {
        data = await response.json();
        console.log("Viewer API response data:", data);

        // Only treat as success if actual details are present
        if (data && data.status && data.ViewerDetail) {
          return NextResponse.json({
            status: true,
            ViewerDetail: data.ViewerDetail,
            isCreator: false,
          });
        }

        // If API says not registered (no details), instruct client to complete viewer profile
        const messageText = (data?.message || "").toLowerCase();
        if (data?.status && !data?.ViewerDetail && messageText.includes('not registered')) {
          return NextResponse.json({
            status: false,
            needsProfileSetup: true,
            preferredType: 'user',
          }, { status: 404 });
        }
        // Otherwise fall through to try creator endpoint
      }
    } catch (error) {
      console.log("Viewer endpoint failed, trying creator endpoint...", error);
    }

    // If viewer endpoint failed, try creator endpoint
    console.log("Making request to external API for creator details", {
      url: `${API_BASE_URL}/creator/getDetail`,
      uuid: uuid,
    });

    try {
      response = await fetch(`${API_BASE_URL}/creator/getDetail`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "uuid": uuid,
          "auth_token": auth_token,
        },
      });

      console.log("Creator API response status:", response.status);

      if (response.ok) {
        data = await response.json();
        console.log("Creator API response data:", data);

        // Only treat as success if actual details are present
        if (data && data.status && (data.CreatorDetail || data.ViewerDetail)) {
          return NextResponse.json({
            status: true,
            ViewerDetail: data.CreatorDetail || data.ViewerDetail,
            isCreator: true,
          });
        }

        // If API says creator not registered (no details), instruct client to complete creator profile
        const messageText = (data?.message || "").toLowerCase();
        if (data?.status && !data?.CreatorDetail && !data?.ViewerDetail && messageText.includes('not registered')) {
          return NextResponse.json({
            status: false,
            needsProfileSetup: true,
            preferredType: 'creator',
          }, { status: 404 });
        }
        // Otherwise fall through to needsProfileSetup
      }
    } catch (error) {
      console.log("Creator endpoint also failed", error);
    }

    // If both endpoints failed, check if user needs to complete profile
    // This happens when is_creator is null (user hasn't completed signup)
    console.log("Both endpoints failed, user may need to complete profile");
    return NextResponse.json(
      {
        status: false,
        error: "Profile incomplete",
        message: "User needs to complete profile setup",
        needsProfileSetup: true,
      },
      { status: 404 }
    );

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