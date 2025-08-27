"use client"
import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, MessageCircle, Share, Play, Pause, Volume2, VolumeX, MoreVertical } from 'lucide-react';

const ExplorePage = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likedVideos, setLikedVideos] = useState(new Set());
  const [bookmarkedVideos, setBookmarkedVideos] = useState(new Set());

  // Mock video data
  const videos = [
    {
      id: 1,
      title: "Beyond the Stars",
      description: "Journey into the unknown as humanity takes its first steps beyond our solar system...",
      rating: "53.270000000000005",
      creator: "Sarah Mitchell",
      category: "Sci-Fi",
      duration: "2h 15m",
      views: "1.0K views",
      likes: 94,
      bookmarks: 28,
      thumbnail: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=700&fit=crop&crop=center",
      isVerified: true
    },
    {
      id: 2,
      title: "Ocean's Mystery",
      description: "Deep beneath the waves lies a secret that could change everything we know about marine life...",
      rating: "47.8",
      creator: "David Ocean",
      category: "Documentary",
      duration: "1h 45m",
      views: "2.5K views",
      likes: 156,
      bookmarks: 42,
      thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=700&fit=crop&crop=center",
      isVerified: false
    },
    {
      id: 3,
      title: "Neon Dreams",
      description: "In a cyberpunk future, a hacker discovers a conspiracy that threatens the digital world...",
      rating: "61.2",
      creator: "Alex Cyber",
      category: "Action",
      duration: "2h 8m",
      views: "5.2K views",
      likes: 287,
      bookmarks: 89,
      thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=700&fit=crop&crop=center",
      isVerified: true
    },
    {
      id: 4,
      title: "Mountain's Call",
      description: "A solo climber faces the ultimate challenge in this breathtaking adventure documentary...",
      rating: "55.9",
      creator: "Emma Peak",
      category: "Adventure",
      duration: "1h 32m",
      views: "3.7K views",
      likes: 198,
      bookmarks: 67,
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=700&fit=crop&crop=center",
      isVerified: true
    }
  ];

  const handleLike = (videoId) => {
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const handleBookmark = (videoId) => {
    setBookmarkedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const handleScroll = (e) => {
    const scrollPosition = e.target.scrollTop;
    const videoHeight = window.innerHeight;
    const newCurrentVideo = Math.round(scrollPosition / videoHeight);
    setCurrentVideo(newCurrentVideo);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Main Content */}
      <div 
        className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
      >
        {videos.map((video, index) => (
          <div 
            key={video.id}
            className="relative h-screen w-full snap-start flex items-center justify-center"
            style={{
              backgroundImage: `url(${video.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Video Content */}
            <div className="relative z-10 w-full h-full flex flex-col">
              {/* Top Content */}
              <div className="flex-1 flex items-start justify-between p-4 pt-20">
                <div className="flex-1 max-w-xs">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {video.title}
                  </h1>
                  <p className="text-white/80 text-sm leading-relaxed mb-4">
                    {video.description}
                  </p>
                  
                  {/* Rating Badge */}
                  <div className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full mb-4">
                    <span className="text-white font-semibold text-sm">
                      ⭐ {video.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Swipe for Full Video Button */}
              <div className="absolute bottom-32 right-4">
                <button className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 rounded-full text-white font-medium">
                  <span className="mr-2">Swipe for Full Video</span>
                  <Play className="w-5 h-5" />
                </button>
              </div>

              {/* Right Side Actions */}
              <div className="absolute right-4 bottom-40 flex flex-col items-center space-y-6">
                {/* Like */}
                <button 
                  onClick={() => handleLike(video.id)}
                  className="flex flex-col items-center space-y-1"
                >
                  <div className={`p-3 rounded-full ${likedVideos.has(video.id) ? 'bg-red-500' : 'bg-white/20'} backdrop-blur-sm`}>
                    <Heart className={`w-6 h-6 ${likedVideos.has(video.id) ? 'text-white fill-white' : 'text-white'}`} />
                  </div>
                  <span className="text-white text-xs font-medium">{video.likes + (likedVideos.has(video.id) ? 1 : 0)}</span>
                </button>

                {/* Bookmark */}
                <button 
                  onClick={() => handleBookmark(video.id)}
                  className="flex flex-col items-center space-y-1"
                >
                  <div className={`p-3 rounded-full ${bookmarkedVideos.has(video.id) ? 'bg-yellow-500' : 'bg-white/20'} backdrop-blur-sm`}>
                    <Bookmark className={`w-6 h-6 ${bookmarkedVideos.has(video.id) ? 'text-white fill-white' : 'text-white'}`} />
                  </div>
                  <span className="text-white text-xs font-medium">{video.bookmarks + (bookmarkedVideos.has(video.id) ? 1 : 0)}</span>
                </button>

                {/* Chat */}
                <button className="flex flex-col items-center space-y-1">
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs font-medium">Chat</span>
                </button>

                {/* Share */}
                <button className="flex flex-col items-center space-y-1">
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <Share className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs font-medium">Share</span>
                </button>
              </div>

              {/* Bottom Creator Info */}
              <div className="absolute bottom-20 left-4 right-20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {video.creator.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{video.creator}</span>
                      {video.isVerified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-white/60">
                      <span className="bg-purple-600 px-2 py-1 rounded text-xs">{video.category}</span>
                      <span>{video.duration}</span>
                      <span>{video.views}</span>
                    </div>
                  </div>
                </div>

                <p className="text-white/90 text-sm">
                  Amazing performance! 🔥
                </p>
              </div>

              {/* Play/Pause Control */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-4 rounded-full bg-black/50 backdrop-blur-sm transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
                >
                  {isPlaying ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white ml-1" />
                  )}
                </button>
              </div>

              {/* Volume Control */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-24 right-4 p-2 rounded-full bg-black/50 backdrop-blur-sm"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>

              {/* More Options */}
              <button className="absolute top-24 left-4 p-2 rounded-full bg-black/50 backdrop-blur-sm">
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
        
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ExplorePage;