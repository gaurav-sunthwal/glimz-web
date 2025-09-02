import { NextResponse } from 'next/server';

const API_BASE_URL = 'http://api.glimznow.com/api';

export async function POST(request) {
  try {
    const { mobileNo, isCreator } = await request.json();

    if (!mobileNo) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile_no: mobileNo,
        isCreator: isCreator || 0
      })
    });

    const data = await response.json();
    
    if (data.status) {
      // Don't send OTP in response for security
      return NextResponse.json({
        status: true,
        message: 'OTP sent successfully'
      });
    } else {
      return NextResponse.json({
        status: false,
        message: data.message || 'Failed to send OTP'
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
