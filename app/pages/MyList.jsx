"use client"

import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/VideoCard';
import videosData from '@/data/videos.json';
import { useAppStore } from '../store/appStore';

export const MyList = ({ onBack, onPlay, onViewDetails }) => {
  const { watchlist, removeFromWatchlist } = useAppStore();
  const [watchlistVideos, setWatchlistVideos] = useState([]);

  useEffect(() => {
    const videos = videosData.filter(video => watchlist.includes(video.id));
    setWatchlistVideos(videos);
  }, [watchlist]);

  const handleRemoveFromList = (videoId) => {
    removeFromWatchlist(videoId);
  };

  const handleClearAll = () => {
    watchlistVideos.forEach(video => removeFromWatchlist(video.id));
  };

  return (
    <div className="min-h-screen bg-background text-white pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-400 fill-current" />
                My List
              </h1>
              <p className="text-foreground-muted mt-2">
                {watchlistVideos.length} {watchlistVideos.length === 1 ? 'video' : 'videos'} in your watchlist
              </p>
            </div>
          </div>

          {watchlistVideos.length > 0 && (
            <Button
              onClick={handleClearAll}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        {/* Content */}
        {watchlistVideos.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-white/40" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Your list is empty</h2>
            <p className="text-foreground-muted mb-8 max-w-md">
              Add movies and shows to your list by clicking the heart icon when browsing. 
              Your saved content will appear here for easy access.
            </p>
            <Button onClick={onBack} className="btn-glimz-primary">
              Browse Movies & Shows
            </Button>
          </div>
        ) : (
          // Video Grid
          <div className="">
            {watchlistVideos.map((video) => (
              <div key={video.id} className="relative group">
                <VideoCard
                  video={video}
                  onPlay={onPlay}
                  onAddToList={handleRemoveFromList}
                  onViewDetails={onViewDetails}
                  isInWatchlist={true}
                  size={medium}
                />
                
                {/* Remove Button */}
                <Button
                  onClick={() => handleRemoveFromList(video.id)}
                  variant="ghost"
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500/30"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
