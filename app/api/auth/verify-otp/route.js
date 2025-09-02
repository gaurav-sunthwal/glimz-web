import { NextResponse } from 'next/server';

const API_BASE_URL = 'http://api.glimznow.com/api';

export async function POST(request) {
  try {
    const { mobileNo, otp } = await request.json();
    console.log('OTP verification request:', { mobileNo, otp });

    if (!mobileNo || !otp) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Mobile number and OTP are required' },
        { status: 400 }
      );
    }

    console.log('Calling external API:', `${API_BASE_URL}/user/otp-verified`);
    const response = await fetch(`${API_BASE_URL}/user/otp-verified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile_no: mobileNo,
        otp: otp
      })
    });

    const data = await response.json();
    console.log('External API response:', data);
    
    if (data.status && data.auth_token) {
      console.log('Setting cookies for successful verification');
      
      // Create response with cookies
      const response = NextResponse.json({
        status: true,
        message: 'OTP verified successfully',
        auth_token: data.auth_token,
        uuid: data.uuid,
        user: data.user
      });

      // Set cookies in the response
      response.cookies.set('auth_token', data.auth_token, {
        httpOnly: false, // Allow client-side access for debugging
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      if (data.uuid) {
        response.cookies.set('uuid', data.uuid, {
          httpOnly: false, // Allow client-side access for debugging
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/'
        });
      }

      if (data.user) {
        response.cookies.set('user_data', JSON.stringify(data.user), {
          httpOnly: false, // Allow client-side access for debugging
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/'
        });
      }

      console.log('Cookies set successfully in response');
      console.log('Response cookies:', response.cookies.getAll());
      return response;
    } else {
      console.log('OTP verification failed:', data.message);
      return NextResponse.json({
        status: false,
        message: data.message || 'Invalid OTP'
      });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
