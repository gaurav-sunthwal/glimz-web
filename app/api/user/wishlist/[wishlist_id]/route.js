import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com/api';

export async function PUT(request, context) {
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

    const params = await context.params;
    const { wishlist_id } = params;
    const body = await request.json();
    const { wishlist_name } = body;

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

    const response = await fetch(
      `${API_BASE_URL}/user/wishlist/${wishlist_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "uuid": uuid,
          "auth_token": auth_token,
        },
        body: JSON.stringify({
          wishlist_name,
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in PUT /api/user/wishlist/[wishlist_id]:", error);
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

export async function DELETE(request, context) {
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

    const params = await context.params;
    const { wishlist_id } = params;

    const response = await fetch(
      `${API_BASE_URL}/user/wishlist/${wishlist_id}`,
      {
        method: "DELETE",
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
    console.error("Error in DELETE /api/user/wishlist/[wishlist_id]:", error);
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

