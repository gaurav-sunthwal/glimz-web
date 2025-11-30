import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      username,
      email,
      channel_name,
      channel_link,
      subscribers,
      content_length,
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !username || !email || !channel_name || !channel_link || !subscribers || !content_length) {
      return NextResponse.json(
        {
          status: false,
          code: 400,
          message: 'All fields are required',
        },
        { status: 400 }
      );
    }

    // Get auth tokens from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const uuid = cookieStore.get('uuid')?.value;

    if (!authToken || !uuid) {
      return NextResponse.json(
        {
          status: false,
          code: 401,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/creator/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        auth_token: authToken,
        uuid: uuid,
      },
      body: JSON.stringify({
        first_name,
        last_name,
        username,
        email,
        channel_name,
        channel_link,
        subscribers,
        content_length,
      }),
    });

    const data = await response.json();

    // If creator creation is successful, update is_creator cookie
    if (data.status) {
      const nextResponse = NextResponse.json(data, { status: response.status });
      nextResponse.cookies.set('is_creator', '1', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      return nextResponse;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        status: false,
        code: 500,
        message: 'Creator registration failed',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

