import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * API endpoint to check if session is incomplete
 * Returns true if auth_token and uuid exist but is_creator cookie is missing
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const uuid = cookieStore.get('uuid')?.value;
    const isCreator = cookieStore.get('is_creator')?.value;

    // Check if auth_token and uuid exist but is_creator cookie is missing
    const isIncompleteSession = authToken && uuid && !isCreator;

    return NextResponse.json({
      isIncompleteSession,
      hasAuthToken: !!authToken,
      hasUuid: !!uuid,
      hasIsCreator: !!isCreator,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        isIncompleteSession: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
