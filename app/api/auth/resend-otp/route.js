import { NextResponse } from 'next/server';

const API_BASE_URL = 'http://api.glimznow.com/api';

export async function POST(request) {
  try {
    const { mobileNo } = await request.json();

    if (!mobileNo) {
      return NextResponse.json(
        { status: false, message: 'Mobile number is required' },
        { status: 400 }
      );
    }

    const resp = await fetch(`${API_BASE_URL}/user/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile_no: mobileNo })
    });

    const data = await resp.json();

    if (data.status) {
      return NextResponse.json({ status: true, message: data.message || 'OTP resent successfully' });
    }

    return NextResponse.json({ status: false, message: data.message || 'Failed to resend OTP' }, { status: 400 });
  } catch {
    return NextResponse.json({ status: false, message: 'Internal server error' }, { status: 500 });
  }
}


