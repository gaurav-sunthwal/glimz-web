"use client"

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
    small: 'w-48 h-28',
    medium: 'w-64 h-36',
    large: 'w-80 h-44'
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div 
      className={`video-card group relative ${sizeClasses[size]} flex-shrink-0 cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails?.(video.id)}
    >
      {/* Thumbnail Container */}
      <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-900">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg" />
        )}
        
        {/* Thumbnail Image */}
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isHovered ? 'scale-105' : 'scale-100'}`}
          onLoad={handleImageLoad}
          loading="lazy"
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Duration Badge */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
        
        {/* Live Badge (if applicable) */}
        {video.isLive && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(video.id);
            }}
            className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 p-3 rounded-full transition-all duration-200"
          >
            <Play className="h-5 w-5 fill-current" />
          </Button>
        </div>
        
        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
          {/* Title */}
          <h3 className="text-white font-medium text-sm leading-tight line-clamp-2 mb-1">
            {video.title}
          </h3>
          
          {/* Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/80">
              {video.releaseYear && <span>{video.releaseYear}</span>}
              {video.rating && (
                <>
                  <span>•</span>
                  <span className="px-1 py-0.5 bg-white/20 rounded text-white/90 text-[10px]">
                    {video.rating}
                  </span>
                </>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {video.likes && (
                <div className="flex items-center gap-1 text-white/70 text-xs">
                  <ThumbsUp className="h-3 w-3" />
                  <span>{video.likes}%</span>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToList?.(video.id);
                }}
                className={`p-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 ${
                  isInWatchlist ? 'text-red-400' : 'text-white hover:text-red-400'
                } transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              >
                <Heart className={`h-3 w-3 ${isInWatchlist ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Genre Tags (on hover) */}
        {video.genre && (
          <div className={`absolute top-2 left-2 flex flex-wrap gap-1 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            {video.genre.slice(0, 2).map((genre) => (
              <span 
                key={genre} 
                className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full border border-white/20"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};