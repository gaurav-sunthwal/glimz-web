import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mobile_no } = body;

    if (!mobile_no) {
      return NextResponse.json(
        {
          status: false,
          code: 400,
          message: 'Mobile number is required',
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/user/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobile_no }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        code: 500,
        message: 'Failed to resend OTP',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

