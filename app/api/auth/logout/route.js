import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({
      status: true,
      message: 'Logged out successfully'
    });

    // Clear all authentication cookies
    response.cookies.set('auth_token', '', {
      maxAge: 0,
      path: '/'
    });
    
    response.cookies.set('uuid', '', {
      maxAge: 0,
      path: '/'
    });
    
    response.cookies.set('user_data', '', {
      maxAge: 0,
      path: '/'
    });

    console.log('Logout successful, cookies cleared');
    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
