import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com/api';

export async function GET() {
  try {
    // Get auth tokens from cookies
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const uuid = cookieStore.get('uuid')?.value;

    if (!authToken || !uuid) {
      return NextResponse.json(
        {
          status: false,
          code: 401,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/creator/getDetail`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        auth_token: authToken,
        uuid: uuid,
      },
    });

    const data = await response.json();

    // Ensure consistent response format
    if (data.status && (data.data || data.creatorDetail || data.CreatorDetail)) {
      const creatorDetail = data.data || data.creatorDetail || data.CreatorDetail;
      return NextResponse.json({
        status: true,
        data: creatorDetail,
        creatorDetail: creatorDetail,
        isCreator: true,
      }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        code: 500,
        message: 'Failed to get creator details',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

