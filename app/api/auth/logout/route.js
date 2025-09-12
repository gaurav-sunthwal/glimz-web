import { NextResponse } from 'next/server';

export async function POST() {
  // Clear auth cookies
  const response = NextResponse.json({ status: true, message: 'Logged out successfully' });

  // Expire cookies immediately
  response.cookies.set('auth_token', '', { path: '/', maxAge: 0 });
  response.cookies.set('uuid', '', { path: '/', maxAge: 0 });
  response.cookies.set('user_data', '', { path: '/', maxAge: 0 });
  response.cookies.set('is_creator', '', { path: '/', maxAge: 0 });

  return response;
}


