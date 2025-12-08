import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Heart, Share, Plus, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCarousel } from '@/components/VideoCarousel';
import { useAppStore } from '@/store/appStore';
import videosData from '@/data/videos.json';

export const VideoDetails = ({ videoId, onBack, onPlay }) => {
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
          <div className="w-16 h-16 border-4 border-glimz-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground-muted">Loading video details...</p>
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

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Video Player Section */}
      <section className="relative h-screen">
        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="ghost"
          className="absolute top-20 left-4 z-50 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 hover:bg-black/70"
        >
          <ArrowLeft className="h-6 w-6" />
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
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-20">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              {video.title}
            </h1>
            
            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{video.releaseYear}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{video.duration}</span>
              </div>
              <span className="px-2 py-1 bg-white/20 rounded text-sm font-medium">
                {video.rating}
              </span>
              <div className="flex gap-2">
                {video.genre.map((genre) => (
                  <span key={genre} className="genre-tag">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xl text-white/90 leading-relaxed">
              {video.description}
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Button
                onClick={() => onPlay(video.id)}
                className="btn-glimz-primary text-lg px-8 py-4 shadow-glow"
              >
                <Play className="h-6 w-6 mr-2 fill-current" />
                Watch Now
              </Button>
              
              <Button
                onClick={handleWatchlistToggle}
                className={`btn-glimz-secondary text-lg px-8 py-4 ${
                  isInWatchlist ? 'bg-red-500/20 border-red-500/50' : ''
                }`}
              >
                <Heart className={`h-6 w-6 mr-2 ${isInWatchlist ? 'fill-current text-red-400' : ''}`} />
                {isInWatchlist ? 'Remove from List' : 'Add to My List'}
              </Button>

              <Button
                variant="ghost"
                className="btn-glimz-secondary text-lg px-6 py-4"
              >
                <Share className="h-6 w-6 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Section */}
      {recommendedVideos.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <VideoCarousel
            title="You Might Also Like"
            videos={recommendedVideos}
            onPlay={onPlay}
            onAddToList={(id) => {
              if (watchlist.includes(id)) {
                removeFromWatchlist(id);
              } else {
                addToWatchlist(id);
              }
            }}
            onViewDetails={(id) => {
              // This would navigate to the new video details
              console.log('Navigate to video:', id);
            }}
            watchlist={watchlist}
            size="medium"
          />
        </div>
      )}
    </div>
  );
};

export default VideoDetails;
