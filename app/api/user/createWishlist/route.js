import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = "http://api.glimznow.com/api";

export async function POST(request) {
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

    const body = await request.json();
    const { wishlist_name, content_id } = body;

    if (!wishlist_name) {
      return NextResponse.json(
        {
          status: false,
          code: 400,
          message: "Wishlist name is required",
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/user/createWishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "uuid": uuid,
        "auth_token": auth_token,
      },
      body: JSON.stringify({
        wishlist_name,
        ...(content_id && { content_id }),
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in POST /api/user/createWishlist:", error);
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

