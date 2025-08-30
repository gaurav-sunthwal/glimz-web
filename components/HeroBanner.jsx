"use client"

import { useState, useEffect } from 'react';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HeroBanner = ({ video, onPlay, onMoreInfo }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    setImageLoaded(false);
  }, [video.id]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <section className="relative h-[80vh] md:h-[70vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-background-secondary animate-pulse" />
        )}
        <img
          src={video.heroImage}
          alt={video.title}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          {/* Title */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              {video.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-white/80">
              <span className="text-base sm:text-lg font-medium">{video.releaseYear}</span>
              <span className="px-2 py-1 bg-white/20 rounded text-xs sm:text-sm font-medium">
                {video.rating}
              </span>
              <span className="text-base sm:text-lg">{video.duration}</span>
              <div className="flex gap-1 sm:gap-2">
                {video.genre.slice(0, 2).map((genre) => (
                  <span key={genre} className="genre-tag text-xs sm:text-sm">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-xl">
            {video.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Button
              onClick={() => onPlay?.(video.id)}
              className="btn-glimz-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-glow w-full sm:w-auto"
            >
              <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2 fill-current" />
              Watch Now
            </Button>
            
            <Button
              onClick={() => onMoreInfo?.(video.id)}
              className="btn-glimz-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
            >
              <Info className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              More Info
            </Button>
          </div>

          {/* Audio Control */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              )}
            </Button>
            <span className="text-white/60 text-xs sm:text-sm">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/40 rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-white/60 rounded-full mt-1 sm:mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};
