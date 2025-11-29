import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mobile_no, otp } = body;

    if (!mobile_no || !otp) {
      return NextResponse.json(
        {
          status: false,
          code: 400,
          message: 'Mobile number and OTP are required',
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/user/otp-verified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile_no, otp }),
    });

    const data = await response.json();

    // If OTP verification is successful, store auth tokens in cookies
    if (data.status && (data.data || data.auth_token)) {
      const responseData = data.data || data;
      const { auth_token, uuid, user } = responseData;

      if (auth_token && uuid) {
        const cookieStore = cookies();
        const nextResponse = NextResponse.json(data, { status: response.status });

        // Set auth cookies
        nextResponse.cookies.set('auth_token', auth_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        nextResponse.cookies.set('uuid', uuid, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        // Set is_creator cookie (non-httpOnly for client-side access)
        if (user && user.is_creator !== null && user.is_creator !== undefined) {
          nextResponse.cookies.set('is_creator', user.is_creator.toString(), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          });
        }

        return nextResponse;
      }
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        code: 500,
        message: 'OTP verification failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

