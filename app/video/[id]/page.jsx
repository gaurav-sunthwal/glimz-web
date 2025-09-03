"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Heart, Share, Plus, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCarousel } from '@/components/VideoCarousel';
import { useAppStore } from '../../store/appStore';
import videosData from '@/data/videos.json';

export default function VideoDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id;
  
  const { watchlist, addToWatchlist, removeFromWatchlist } = useAppStore();
  const [video, setVideo] = useState(null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);

  useEffect(() => {
    const foundVideo = videosData.find(v => v.id === videoId);
    if (foundVideo) {
      setVideo(foundVideo);
      
      // Get recommended videos (same genre or random)
      const recommended = videosData
        .filter(v => v.id !== videoId)
        .filter(v => v.genre.some(g => foundVideo.genre.includes(g)))
        .slice(0, 12);
      
      setRecommendedVideos(recommended);
    }
  }, [videoId]);

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-glimz-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground-muted text-sm sm:text-base">Loading video details...</p>
        </div>
      </div>
    );
  }

  const isInWatchlist = watchlist.includes(video.id);

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlist(video.id);
    } else {
      addToWatchlist(video.id);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const handlePlayVideo = () => {
    // In a real app, this would open a video player
    console.log('Playing video:', video.id);
  };

  const handleViewDetails = (videoId) => {
    router.push(`/video/${videoId}`);
  };

  const handleAddToList = (videoId) => {
    if (watchlist.includes(videoId)) {
      removeFromWatchlist(videoId);
    } else {
      addToWatchlist(videoId);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Video Player Section */}
      <section className="relative h-screen">
        {/* Back Button */}
        <Button
          onClick={handleBack}
          variant="ghost"
          className="absolute top-16 sm:top-20 left-3 sm:left-4 z-50 p-2 sm:p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 hover:bg-black/70"
        >
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

        {/* Video Background */}
        <div className="absolute inset-0">
          <img
            src={video.heroImage}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        </div>

        {/* Video Info Overlay */}
        <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-full flex items-end pb-16 sm:pb-20">
          <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              {video.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-white/80">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-sm sm:text-base">{video.releaseYear}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-sm sm:text-base">{video.duration}</span>
              </div>
              <span className="px-2 py-1 bg-white/20 rounded text-xs sm:text-sm font-medium">
                {video.rating}
              </span>
              <div className="flex gap-1 sm:gap-2">
                {video.genre.map((genre) => (
                  <span key={genre} className="genre-tag text-xs sm:text-sm">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed">
              {video.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Button
                onClick={handlePlayVideo}
                className="btn-glimz-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-glow w-full sm:w-auto"
              >
                <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2 fill-current" />
                Watch Now
              </Button>
              
              <Button
                onClick={handleWatchlistToggle}
                variant="ghost"
                className="p-3 sm:p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 w-full sm:w-auto"
              >
                <Heart className={`h-5 w-5 sm:h-6 sm:w-6 ${isInWatchlist ? 'fill-current text-red-400' : ''}`} />
              </Button>

              <Button
                variant="ghost"
                className="p-3 sm:p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 w-full sm:w-auto"
              >
                <Share className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Videos */}
      {recommendedVideos.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">More Like This</h2>
            <VideoCarousel
              title=""
              videos={recommendedVideos}
              onPlay={handlePlayVideo}
              onAddToList={handleAddToList}
              onViewDetails={handleViewDetails}
              watchlist={watchlist}
              size="large"
            />
          </div>
        </section>
      )}
    </div>
  );
}
