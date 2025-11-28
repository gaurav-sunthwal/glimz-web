import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    const nextResponse = NextResponse.json({ status: true, message: 'Logged out successfully' });

    // Clear all auth cookies
    nextResponse.cookies.delete('auth_token');
    nextResponse.cookies.delete('uuid');
    nextResponse.cookies.delete('is_creator');

    return nextResponse;
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        code: 500,
        message: 'Logout failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

