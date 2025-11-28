import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = "http://api.glimznow.com/api";

export async function GET() {
  try {
    // Get UUID and auth token from cookies
    const cookieStore = cookies();
    const uuid = cookieStore.get("uuid")?.value;
    const auth_token = cookieStore.get("auth_token")?.value;

    console.log("Fetching user details for regular user:", { uuid, auth_token });

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

    // Fetch from viewer endpoint
    console.log("Making request to viewer endpoint:", {
      url: `${API_BASE_URL}/viewer/getDetail`,
      uuid: uuid,
    });

    try {
      const response = await fetch(`${API_BASE_URL}/viewer/getDetail`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "uuid": uuid,
          "auth_token": auth_token,
        },
      });

      console.log("Viewer API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Viewer API response data:", data);

        // Check if we got valid user details - handle both response formats
        const viewerDetail = data?.ViewerDetail || data?.data;
        if (data && data.status && viewerDetail) {
          console.log("✅ Successfully fetched user details from viewer endpoint");
          return NextResponse.json({
            status: true,
            data: viewerDetail, // Match React Native format: response.data
            ViewerDetail: viewerDetail, // Also include for backward compatibility
            isCreator: false,
          });
        }

        // If API says not registered, user needs to complete profile
        const messageText = (data?.message || "").toLowerCase();
        if (data?.status && !data?.ViewerDetail && messageText.includes('not registered')) {
          return NextResponse.json({
            status: false,
            needsProfileSetup: true,
            preferredType: 'user',
          }, { status: 404 });
        }
      }
    } catch (error) {
      console.log("Viewer endpoint failed:", error);
    }

    // If viewer endpoint failed, user needs profile setup
    console.log("Viewer endpoint failed, user needs profile setup");
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
    console.error("Error in GET /api/user/get-user-details:", error);
    return NextResponse.json(
      {
        status: false,
        error: "Internal server error",
        message: "An unexpected error occurred while fetching user details",
      },
      { status: 500 }
    );
  }
}
