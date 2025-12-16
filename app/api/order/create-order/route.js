import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.glimznow.com';

export async function POST(request) {
    try {
        // Try to get credentials from headers first (for iOS app redirects)
        const headerUuid = request.headers.get("uuid");
        const headerAuthToken = request.headers.get("auth_token");

        // Get credentials from cookies as fallback
        const cookieStore = await cookies();
        const cookieAuthToken = cookieStore.get('auth_token')?.value;
        const cookieUuid = cookieStore.get('uuid')?.value;

        // Use header values if available, otherwise fall back to cookies
        const authToken = headerAuthToken || cookieAuthToken;
        const uuid = headerUuid || cookieUuid;

        console.log('Order creation auth source:', {
            fromHeaders: !!headerUuid && !!headerAuthToken,
            fromCookies: !!cookieUuid && !!cookieAuthToken,
        });

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

        const body = await request.json();
        const { content_id } = body;

        if (!content_id) {
            return NextResponse.json(
                {
                    status: false,
                    code: 400,
                    message: 'Missing required field: content_id',
                },
                { status: 400 }
            );
        }

        // Fetch content list to get the video details with correct price
        const contentResponse = await fetch(`${API_BASE_URL}/api/content?page=1&limit=100`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'auth_token': authToken,
                'uuid': uuid,
            },
        });

        const contentData = await contentResponse.json();

        console.log('=== Content API Response ===');
        console.log('Status:', contentData.status);
        console.log('Data exists:', contentData.data ? 'yes' : 'no');

        if (!contentResponse.ok || !contentData.status || !contentData.data) {
            return NextResponse.json(
                {
                    status: false,
                    code: contentResponse.status,
                    message: contentData.message || 'Failed to fetch content',
                },
                { status: contentResponse.status }
            );
        }

        // Find the specific video by content_id
        const video = contentData.data.find(item => item.content_id === parseInt(content_id));

        if (!video) {
            console.error('Video not found in content list');
            return NextResponse.json(
                {
                    status: false,
                    code: 404,
                    message: 'Video not found',
                },
                { status: 404 }
            );
        }

        console.log('=== Found Video ===');
        console.log('content_id:', video.content_id);
        console.log('title:', video.title);
        console.log('is_paid:', video.is_paid);
        console.log('price:', video.price);

        // Extract price directly from video object
        const price = video.price || 0;

        console.log('=== Price Extraction ===');
        console.log('Extracted price:', price);

        const amount = price;
        const currency = 'INR';

        console.log('Final amount:', amount);
        console.log('Currency: INR');

        if (amount <= 0) {
            console.error('=== Invalid Price Error ===');
            console.error('Amount:', amount);
            console.error('is_paid:', video.is_paid);
            console.error('Video object:', video);

            return NextResponse.json(
                {
                    status: false,
                    code: 400,
                    message: 'Invalid video price or content is free',
                    debug: {
                        is_paid: video.is_paid,
                        price: video.price,
                        extracted_amount: amount
                    }
                },
                { status: 400 }
            );
        }

        // Now create the order with the fetched price
        const orderResponse = await fetch(`${API_BASE_URL}/api/order/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth_token': authToken,
                'uuid': uuid,
            },
            body: JSON.stringify({
                amount,
                currency,
                content_id: parseInt(content_id),
            }),
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
            return NextResponse.json(
                {
                    status: false,
                    code: orderResponse.status,
                    message: orderData.message || 'Failed to create order',
                },
                { status: orderResponse.status }
            );
        }

        return NextResponse.json(orderData);
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            {
                status: false,
                code: 500,
                message: 'Internal server error',
                error: error.message,
            },
            { status: 500 }
        );
    }
}
