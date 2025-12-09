import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com/api';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const uuid = cookieStore.get("uuid")?.value;
    const auth_token = cookieStore.get("auth_token")?.value;

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

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    const response = await fetch(
      `${API_BASE_URL}/user/getUserWishlist?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "uuid": uuid,
          "auth_token": auth_token,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in GET /api/user/getUserWishlist:", error);
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

