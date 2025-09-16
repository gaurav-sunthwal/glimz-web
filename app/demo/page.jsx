"use client";

import { useState } from 'react';
import { Play, Shield, Lock, Eye, Settings, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VideoPlayer from '@/components/VideoPlayer';
import videosData from '@/data/videos.json';

export default function DemoPage() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleClose = () => {
    setSelectedVideo(null);
  };

  const handleFullscreenChange = (fullscreen) => {
    setIsFullscreen(fullscreen);
  };

  return (
    <div className="min-h-screen bg-background">
      {selectedVideo ? (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
          <VideoPlayer
            video={selectedVideo}
            onClose={handleClose}
            autoPlay={true}
            isFullscreen={isFullscreen}
            onFullscreenChange={handleFullscreenChange}
          />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Video Streaming Demo</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Experience our secure video streaming platform with advanced protection features
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Shield className="h-3 w-3 mr-1" />
                Download Protection
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Lock className="h-3 w-3 mr-1" />
                Right-click Disabled
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Eye className="h-3 w-3 mr-1" />
                Screen Recording Detection
              </Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <Settings className="h-3 w-3 mr-1" />
                Quality Controls
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videosData.slice(0, 6).map((video) => (
              <Card key={video.id} className="group hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      onClick={() => handlePlayVideo(video)}
                      className="bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/30"
                    >
                      <Play className="h-6 w-6 mr-2" />
                      Watch Now
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-600 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Protected
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {video.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{video.duration}</span>
                    <span>{video.rating}</span>
                    <span>${video.isPaid}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {video.genre.slice(0, 2).map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Security Features</CardTitle>
                <CardDescription>
                  Our video streaming platform includes multiple layers of protection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Content Protection</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        Disabled right-click context menu
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-green-500" />
                        Blocked common keyboard shortcuts
                      </li>
                      <li className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-500" />
                        Developer tools detection
                      </li>
                      <li className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-green-500" />
                        Disabled picture-in-picture mode
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">User Experience</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-500" />
                        Quality selection (360p to 1080p)
                      </li>
                      <li className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-blue-500" />
                        Playback speed control (0.25x to 2x)
                      </li>
                      <li className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-blue-500" />
                        Volume and mute controls
                      </li>
                      <li className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-500" />
                        Fullscreen and subtitle support
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
