import { useState } from 'react';
import { Play, Heart, Clock, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const VideoCard = ({ 
  video, 
  onPlay, 
  onAddToList, 
  onViewDetails,
  isInWatchlist = false,
  size = 'medium'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = {
    small: 'w-48 h-72',
    medium: 'w-64 h-96',
    large: 'w-80 h-[480px]'
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div 
      className={`video-card group relative ${sizeClasses[size]} flex-shrink-0`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails?.(video.id)}
    >
      {/* Thumbnail */}
      <div className="relative w-full h-full overflow-hidden rounded-card">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-background-secondary animate-pulse rounded-card" />
        )}
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="video-card-overlay" />
        
        {/* Hover Content */}
        <div className={`absolute inset-0 p-4 flex flex-col justify-between transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Top Controls */}
          <div className="flex justify-between items-start">
            <div className="flex flex-wrap gap-1">
              {video.genre.slice(0, 2).map((genre) => (
                <span key={genre} className="genre-tag">
                  {genre}
                </span>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddToList?.(video.id);
              }}
              className={`p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 ${
                isInWatchlist ? 'text-red-400' : 'text-white hover:text-red-400'
              }`}
            >
              <Heart className={`h-4 w-4 ${isInWatchlist ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Center Play Button */}
          <div className="flex justify-center">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.(video.id);
              }}
              className="btn-glimz-primary p-4 rounded-full shadow-glow"
            >
              <Play className="h-6 w-6 fill-current" />
            </Button>
          </div>

          {/* Bottom Info */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">
              {video.title}
            </h3>
            <p className="text-white/80 text-sm line-clamp-2">
              {video.shortDescription}
            </p>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-white/60">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {video.duration}
                </span>
                <span>{video.releaseYear}</span>
                <span className="px-1.5 py-0.5 bg-white/20 rounded text-white/80">
                  {video.rating}
                </span>
              </div>
              
              <div className="like-badge">
                <ThumbsUp className="h-3 w-3" />
                {video.likes}%
              </div>
            </div>
          </div>
        </div>

        {/* Static Info (visible when not hovered) */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}>
          <h3 className="text-white font-medium text-base leading-tight line-clamp-2">
            {video.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
            <span>{video.releaseYear}</span>
            <span>•</span>
            <span>{video.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
