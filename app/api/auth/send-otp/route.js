import { NextResponse } from 'next/server';

const API_BASE_URL = 'http://api.glimznow.com/api';

export async function POST(request) {
  try {
    const { mobileNo } = await request.json();

    if (!mobileNo) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile_no: mobileNo })
    });

    const data = await response.json();
    if (data.status) {
      return NextResponse.json({ status: true, message: 'OTP sent successfully' });
    }

    return NextResponse.json({ status: false, message: data.message || 'Failed to send OTP' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


