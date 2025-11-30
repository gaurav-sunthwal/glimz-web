import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const nextResponse = NextResponse.json({ status: true, message: 'Logged out successfully' });

    // Clear all auth cookies
    nextResponse.cookies.delete('auth_token');
    nextResponse.cookies.delete('uuid');
    nextResponse.cookies.delete('is_creator');

    return nextResponse;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        status: false,
        code: 500,
        message: 'Logout failed',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

