import { NextResponse } from 'next/server';

const API_BASE_URL = 'http://api.glimznow.com/api';

export async function POST(request) {
  try {
    const { mobileNo, otp } = await request.json();

    if (!mobileNo || !otp) {
      return NextResponse.json(
        { status: false, message: 'Mobile number and OTP are required' },
        { status: 400 }
      );
    }

    const resp = await fetch(`${API_BASE_URL}/user/otp-verified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile_no: mobileNo, otp })
    });

    const data = await resp.json();

    if (data.status && data.auth_token) {
      // Build response and set cookies expected by our app
      const response = NextResponse.json({
        status: true,
        message: data.message || 'OTP verified successfully',
        auth_token: data.auth_token,
        uuid: data.uuid,
        user: data.user
      });

      response.cookies.set('auth_token', data.auth_token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      });

      if (data.uuid) {
        response.cookies.set('uuid', data.uuid, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/'
        });
      }

      if (data.user) {
        response.cookies.set('user_data', JSON.stringify(data.user), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/'
        });
        
        // Store is_creator status separately for easy access
        const isCreatorValue = data.user.is_creator?.toString() || 'null';
        console.log("Setting is_creator cookie with value:", isCreatorValue);
        response.cookies.set('is_creator', isCreatorValue, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/'
        });
      }

      return response;
    }

    return NextResponse.json({ status: false, message: data.message || 'Invalid OTP' }, { status: 400 });
  } catch {
    return NextResponse.json({ status: false, message: 'Internal server error' }, { status: 500 });
  }
}


