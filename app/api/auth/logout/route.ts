import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const nextResponse = NextResponse.json({ status: true, message: 'Logged out successfully' });

    // Clear all auth cookies by setting them to expire in the past
    // This ensures HttpOnly cookies are also cleared
    const cookiesToClear = ['auth_token', 'uuid', 'is_creator'];
    const expiredDate = new Date(0).toUTCString();
    
    cookiesToClear.forEach(cookieName => {
      // Delete the cookie
      nextResponse.cookies.delete(cookieName);
      
      // Also set it with expired date to ensure it's cleared
      nextResponse.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    });

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

