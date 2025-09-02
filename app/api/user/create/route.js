import { NextResponse } from 'next/server';

const API_BASE_URL = 'http://api.glimznow.com/api';

export async function POST(request) {
  try {
    const { firstName, lastName, email, username } = await request.json();
    console.log('User creation request:', { firstName, lastName, email, username });
    
    // Read cookies from request headers
    const cookieHeader = request.headers.get('cookie');
    console.log('Cookie header:', cookieHeader);
    
    let authToken = null;
    let uuid = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      
      authToken = cookies['auth_token'];
      uuid = cookies['uuid'];
    }

    console.log('Cookies found:', { 
      hasAuthToken: !!authToken, 
      hasUuid: !!uuid,
      authTokenLength: authToken?.length,
      uuid: uuid 
    });

    if (!authToken || !uuid) {
      console.log('Authentication failed - missing cookies');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!firstName || !lastName || !email || !username) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    console.log('Calling external API with headers:', { authToken: authToken.substring(0, 20) + '...', uuid });
    // Call the external API with proper headers
    const response = await fetch(`${API_BASE_URL}/viewer/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth_token': authToken,
        'uuid': uuid
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        username: username
      })
    });

    const data = await response.json();
    console.log('External API response:', data);
    
    if (data.status) {
      return NextResponse.json({
        status: true,
        message: 'User created successfully'
      });
    } else {
      return NextResponse.json({
        status: false,
        message: data.message || 'Failed to create user'
      });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
