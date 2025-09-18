"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Lock, Eye, EyeOff, AlertTriangle, Play, Heart, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VideoPlayer from '@/components/VideoPlayer';
import videosData from '@/data/videos.json';

export default function WatchPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.id;

    const [video, setVideo] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSecurityInfo, setShowSecurityInfo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const foundVideo = videosData.find(v => v.id === videoId);
        if (foundVideo) {
            setVideo(foundVideo);
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    }, [videoId]);

    const handleBack = () => {
        router.back();
    };

    const handleFullscreenChange = (fullscreen) => {
        setIsFullscreen(fullscreen);
    };

    const handleClose = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-glimz-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-white">Loading video...</p>
                </div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
                    <h1 className="text-2xl font-bold text-white">Video Not Found</h1>
                    <p className="text-gray-400">The video you're looking for doesn't exist.</p>
                    <Button onClick={handleBack} className="bg-glimz-primary hover:bg-glimz-primary/90">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}

            {/* Security Info Panel */}
            {showSecurityInfo && !isFullscreen && (
                <div className="fixed right-4 z-30 bg-black/90 backdrop-blur-sm rounded-lg p-4 w-80">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-semibold">Security Features</h3>
                            <Button
                                onClick={() => setShowSecurityInfo(false)}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20"
                            >
                                ×
                            </Button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-green-400">
                                <Shield className="h-4 w-4" />
                                <span>Download protection enabled</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                                <Lock className="h-4 w-4" />
                                <span>Right-click disabled</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                                <Eye className="h-4 w-4" />
                                <span>Screen recording detection</span>
                            </div>
                        </div>

                        <Alert className="bg-yellow-900/20 border-yellow-600/30">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-yellow-200 text-xs">
                                This content is protected by copyright. Unauthorized distribution is prohibited.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            )}

            {/* Video Player */}
            <div className={`transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen pt-0'
                }`}>
                <VideoPlayer
                    video={video}
                    onClose={handleClose}
                    autoPlay={true}
                    isFullscreen={isFullscreen}
                    onFullscreenChange={handleFullscreenChange}
                />
            </div>

            {/* Video Details Section - Only show when not in fullscreen */}
            {!isFullscreen && (
                <div className="bg-black py-8">
                    <div className="container mx-auto px-6">
                        <div className="max-w-6xl mx-auto">
                            {/* Video Info */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Info */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div>
                                        <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                                            <span>{video.releaseYear}</span>
                                            <span>•</span>
                                            <span>{video.duration}</span>
                                            <span>•</span>
                                            <span className="px-3 py-1 bg-white/20 rounded text-white font-medium">
                                                {video.rating}
                                            </span>
                                            <div className="flex gap-2">
                                                {video.genre.map((genre) => (
                                                    <Badge key={genre} variant="outline" className="border-white/30 text-white">
                                                        {genre}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed text-lg">
                                            {video.description}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        <Button className="bg-glimz-primary hover:bg-glimz-primary/90 text-white px-6 py-3">
                                            <Play className="h-5 w-5 mr-2" />
                                            Watch Again
                                        </Button>
                                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                            <Heart className="h-5 w-5 mr-2" />
                                            Add to Watchlist
                                        </Button>
                                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                                            <Share className="h-5 w-5 mr-2" />
                                            Share
                                        </Button>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/20">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-glimz-primary">{video.likes}%</div>
                                            <div className="text-sm text-gray-400">Likes</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-white">{video.views || '1.2M'}</div>
                                            <div className="text-sm text-gray-400">Views</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-white">HD</div>
                                            <div className="text-sm text-gray-400">Quality</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-white">${video.isPaid}</div>
                                            <div className="text-sm text-gray-400">Price</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Info */}
                                <div className="space-y-6">
                                    {/* Security Info */}
                                    <div className="bg-white/5 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-glimz-primary" />
                                            Security Features
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span>Download Protection</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span>Right-click Disabled</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span>Screen Recording Detection</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span>DRM Protected</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Video Quality Info */}
                                    <div className="bg-white/5 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold mb-4">Available Quality</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">1080p HD</span>
                                                <Badge className="bg-green-600">Available</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">720p HD</span>
                                                <Badge className="bg-green-600">Available</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">480p</span>
                                                <Badge className="bg-green-600">Available</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">360p</span>
                                                <Badge className="bg-green-600">Available</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Related Videos */}
                                    <div className="bg-white/5 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold mb-4">More Like This</h3>
                                        <div className="space-y-3">
                                            {videosData.filter(v => v.id !== video.id).slice(0, 3).map((relatedVideo) => (
                                                <div key={relatedVideo.id} className="flex gap-3 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors">
                                                    <img
                                                        src={relatedVideo.thumbnail}
                                                        alt={relatedVideo.title}
                                                        className="w-16 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium truncate">{relatedVideo.title}</h4>
                                                        <p className="text-xs text-gray-400">{relatedVideo.duration}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
