import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com/api';

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
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
    const { wishlist_id, content_ids } = body;

    if (!wishlist_id || !content_ids || !Array.isArray(content_ids)) {
      return NextResponse.json(
        {
          status: false,
          code: 400,
          message: "Wishlist ID and Content IDs array are required",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/user/remove-content/wishlist`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "uuid": uuid,
          "auth_token": auth_token,
        },
        body: JSON.stringify({
          wishlist_id,
          content_ids,
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in DELETE /api/user/remove-content/wishlist:", error);
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

