"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color: string;
    };
    handler: (response: RazorpayResponse) => void;
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayInstance {
    open: () => void;
    on: (event: string, handler: (response: RazorpayFailedResponse) => void) => void;
}

interface RazorpayFailedResponse {
    error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: Record<string, unknown>;
    };
}

interface UserDetails {
    name?: string;
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    mobile_no?: string;
}

interface VideoData {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    price: number;
    creator: string;
    genre: string | string[];
    is_paid: boolean;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

export default function PaymentPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const [contentId, setContentId] = useState<string | null>(null);
    const [video, setVideo] = useState<VideoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [userUuid, setUserUuid] = useState<string | null>(null);

    // Extract content ID and auth credentials from URL
    useEffect(() => {
        const id = searchParams.get('c');
        const token = searchParams.get('auth');
        const uuid = searchParams.get('id');

        console.log('🔍 URL Parameters:', { contentId: id, hasAuth: !!token, hasId: !!uuid });

        if (id) {
            setContentId(id);
        } else {
            setError('Invalid payment link - missing content ID');
            setLoading(false);
        }

        // Store auth credentials if provided (from iOS app)
        if (token && uuid) {
            console.log('✅ Authentication credentials found in URL');
            setAuthToken(token);
            setUserUuid(uuid);
        } else {
            console.log('ℹ️ No URL auth credentials - will use cookies');
        }
    }, [searchParams]);

    // Fetch user details
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                // If we have auth credentials from URL, use them
                if (authToken && userUuid) {
                    console.log('🔐 Fetching user details with URL credentials');
                    const response = await fetch('/api/user/details', {
                        headers: {
                            'Content-Type': 'application/json',
                            'uuid': userUuid,
                            'auth_token': authToken,
                        },
                    });
                    const data = await response.json();
                    console.log('📥 User details response:', data);

                    if (data.status && data.ViewerDetail) {
                        setUserDetails(data.ViewerDetail);
                    }
                } else {
                    // Fallback to cookie-based authentication
                    console.log('🍪 Fetching user details with cookies');
                    const response = await fetch('/api/user/details', {
                        credentials: 'include',
                    });
                    const data = await response.json();
                    if (data.status && data.ViewerDetail) {
                        setUserDetails(data.ViewerDetail);
                    }
                }
            } catch (error) {
                console.error('❌ Error fetching user details:', error);
            }
        };

        // Only fetch if we have either URL credentials or we're ready to use cookies
        if ((authToken && userUuid) || (!authToken && !userUuid)) {
            fetchUserDetails();
        }
    }, [authToken, userUuid]);

    // Fetch video details
    useEffect(() => {
        const fetchVideoDetails = async () => {
            if (!contentId) return;

            try {
                setLoading(true);
                // Use the same endpoint as HomePage for consistent data
                const response = await fetch(`/api/content?page=1&limit=100`, {
                    credentials: 'include',
                });

                const data = await response.json();

                console.log('=== Content API Response ===');
                console.log('Status:', data.status);
                console.log('Data array length:', data.data?.length || 0);

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch content');
                }

                if (data.status && data.data && Array.isArray(data.data)) {
                    // Find the specific video by content_id
                    const videoItem = data.data.find((item: Record<string, unknown>) => item.content_id === parseInt(contentId));

                    if (!videoItem) {
                        throw new Error('Video not found');
                    }

                    console.log('=== Found Video ===');
                    console.log('content_id:', videoItem.content_id);
                    console.log('title:', videoItem.title);
                    console.log('price:', videoItem.price);
                    console.log('is_paid:', videoItem.is_paid);

                    const getThumbnailUrl = (thumb: string | { url?: string } | null | undefined): string => {
                        if (!thumb) return '';
                        if (typeof thumb === 'string') return thumb;
                        return thumb.url || '';
                    };

                    const videoData: VideoData = {
                        id: videoItem.content_id as number,
                        title: videoItem.title as string,
                        description: videoItem.description as string,
                        thumbnail: getThumbnailUrl(videoItem.thumbnail),
                        creator: (videoItem.creator_name as string) || 'Unknown Creator',
                        is_paid: videoItem.is_paid as boolean,
                        price: (videoItem.price as number) || 0,
                        genre: (videoItem.genre as string | string[]) || [],
                    };


                    setVideo(videoData);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error: unknown) {
                console.error('Error fetching video:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch video details');
            } finally {
                setLoading(false);
            }
        };

        fetchVideoDetails();
    }, [contentId]);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = async () => {
        if (!video || !contentId) return;

        setProcessing(true);

        try {
            // Prepare headers for order creation
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            // Add auth credentials to headers if available from URL
            if (authToken && userUuid) {
                headers['uuid'] = userUuid;
                headers['auth_token'] = authToken;
                console.log('🔐 Using URL credentials for order creation');
            } else {
                console.log('🍪 Using cookie credentials for order creation');
            }

            // Create order - API will fetch price automatically
            const orderResponse = await fetch('/api/order/create-order', {
                method: 'POST',
                headers: headers,
                credentials: 'include',
                body: JSON.stringify({
                    content_id: parseInt(contentId),
                }),
            });

            const orderData = await orderResponse.json();

            if (!orderData.status || !orderData.data) {
                throw new Error(orderData.message || 'Failed to create order');
            }

            // Initialize Razorpay
            const options = {
                key: 'rzp_live_RiNn1BPEYhB4kp',
                amount: video.price * 100,
                currency: 'INR',
                name: 'Glimz',
                description: `Payment for ${video.title}`,
                image: 'https://i.postimg.cc/5Npw73Br/logo.png',
                order_id: orderData.data.id,
                prefill: {
                    name: userDetails ? `${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim() : '',
                    email: userDetails?.email || '',
                    contact: userDetails?.mobile_no || '',
                },
                theme: {
                    color: '#7B2CFF',
                },
                handler: async (response: RazorpayResponse) => {
                    // Payment successful
                    console.log('Payment successful:', response);

                    // Create slug from title
                    const titleSlug = video.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');

                    // Redirect to video page
                    router.push(`/${titleSlug}?c=${contentId}&t=0`);
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    },
                },
            };

            const razorpay: RazorpayInstance = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response: RazorpayFailedResponse) {
                console.error('Payment failed:', response);
                setError('Payment failed. Please try again.');
                setProcessing(false);
            });

            razorpay.open();
        } catch (error: unknown) {
            console.error('Payment error:', error);
            setError(error instanceof Error ? error.message : 'Failed to process payment');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {error ? 'Error' : 'Video Not Found'}
                    </h2>
                    <p className="text-white/60 mb-6">{error || 'Unable to load payment details'}</p>
                    <Button
                        onClick={() => router.push('/')}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
                <div className="container mx-auto px-4 py-4">
                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="space-y-8">
                    {/* Page Title */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Complete Your Purchase
                        </h1>
                        <p className="text-white/60">Secure payment powered by Razorpay</p>
                    </div>

                    {/* Video Preview Card */}
                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300">
                        <div className="grid md:grid-cols-2 gap-6 p-6">
                            {/* Thumbnail */}
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                                {video.thumbnail ? (
                                    <Image
                                        src={video.thumbnail}
                                        alt={video.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                                        <span className="text-white/40">No preview</span>
                                    </div>
                                )}
                            </div>

                            {/* Video Info */}
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">{video.title}</h2>
                                    <p className="text-purple-400 text-sm">by {video.creator}</p>
                                </div>

                                {video.description && (
                                    <p className="text-white/70 text-sm line-clamp-3">
                                        {video.description}
                                    </p>
                                )}

                                {video.genre && (Array.isArray(video.genre) ? video.genre.length > 0 : !!video.genre) && (
                                    <div className="flex flex-wrap gap-2">
                                        {(Array.isArray(video.genre) ? video.genre : [video.genre]).slice(0, 3).map((genre: string, index: number) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-white/10 text-white/80 text-xs rounded-full border border-white/20"
                                            >
                                                {genre}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/30 p-6 space-y-4">
                        <h3 className="text-xl font-semibold mb-4">Price Details</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-white/70">Video Price</span>
                                <span className="text-lg">₹{video.price}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-white/70">Platform Fee</span>
                                <span className="text-lg text-green-400">₹0</span>
                            </div>

                            <div className="border-t border-white/20 pt-3 mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold">Total Amount</span>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                        ₹{video.price}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Button */}
                    <Button
                        onClick={handlePayment}
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Lock className="mr-2 h-5 w-5" />
                                Proceed to Payment
                            </>
                        )}
                    </Button>

                    {/* Security Badges */}
                    <div className="flex items-center justify-center gap-6 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-400" />
                            <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-400" />
                            <span>Powered by Razorpay</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
