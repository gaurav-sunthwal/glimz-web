"use client"

import { useState, useEffect } from 'react';
import { Play, Info, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export const HeroBanner = ({ video, videos, onPlay, onMoreInfo }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Support both single video and multiple videos
  const videoList = videos && videos.length > 0 ? videos : (video ? [video] : []);
  const currentVideo = videoList[currentIndex];

  useEffect(() => {
    setImageLoaded(false);
    if (videos && videos.length > 0) {
      setCurrentIndex(0);
    }
  }, [videos?.length, video?.id]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  // Auto-rotate through videos if multiple videos provided
  useEffect(() => {
    if (videoList.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videoList.length);
    }, 8000); // Change video every 8 seconds

    return () => clearInterval(interval);
  }, [videoList.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + videoList.length) % videoList.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videoList.length);
  };

  if (!currentVideo) return null;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        h-[60vh] xs:h-[65vh] sm:h-[70vh] md:h-[75vh] lg:h-[80vh] xl:h-[85vh]
        min-h-[340px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[520px]
        flex flex-col
      "
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-background-secondary animate-pulse" />
        )}
        <img
          src={currentVideo.heroImage || currentVideo.thumbnail}
          alt={currentVideo.title}
          className={`
            w-full h-full object-cover transition-opacity duration-700
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={handleImageLoad}
          draggable={false}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div
        className="
          relative z-10
          w-full
          h-full
          flex items-center
          px-3 xs:px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24
          max-w-full
        "
      >
        <div
          className="
            w-full
            max-w-full
            sm:max-w-2xl
            md:max-w-3xl
            lg:max-w-4xl
            xl:max-w-5xl
            space-y-3 xs:space-y-4 sm:space-y-6
            bg-black/0
          "
        >
          {/* Title */}
          <div className="space-y-1 xs:space-y-2 sm:space-y-3">
            <h1
              className="
                text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl
                font-bold text-white leading-tight
                break-words
                max-w-full
              "
              style={{ wordBreak: 'break-word' }}
            >
              {currentVideo.title}
            </h1>
            <div className="flex flex-wrap items-center gap-1 xs:gap-2 sm:gap-3 md:gap-4 text-white/80">
              <span className="text-sm xs:text-base sm:text-lg font-medium">{currentVideo.releaseYear}</span>
              {currentVideo.rating && (
                <span className="px-2 py-1 bg-white/20 rounded text-xs xs:text-sm font-medium">
                  {currentVideo.rating}
                </span>
              )}
              {currentVideo.duration && currentVideo.duration !== 'N/A' && (
                <span className="text-sm xs:text-base sm:text-lg">{currentVideo.duration}</span>
              )}
              {currentVideo.genre && currentVideo.genre.length > 0 && (
                <div className="flex gap-1 xs:gap-2">
                  {currentVideo.genre.slice(0, 2).map((genre) => (
                    <span key={genre} className="genre-tag text-xs xs:text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p
            className="
              text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl
              text-white/90 leading-relaxed
              max-w-full sm:max-w-xl md:max-w-2xl
              line-clamp-4 sm:line-clamp-5 md:line-clamp-6
              break-words
            "
            style={{ wordBreak: 'break-word' }}
          >
            {currentVideo.description}
          </p>

          {/* Action Buttons - in one row always */}
          <div className="flex flex-row items-center gap-2 xs:gap-3 sm:gap-4 w-full">
            <Button
              onClick={() => router.push(`/video/${currentVideo.id}`)}
              className="
                btn-glimz-primary
                text-xs xs:text-sm sm:text-base
                px-3 xs:px-4 sm:px-5
                py-2
                shadow-glow
                flex items-center justify-center
                min-w-[110px]
              "
            >
              <Play className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 mr-2 fill-current" />
              Watch Now
            </Button>

            <Button
              onClick={() => onMoreInfo?.(currentVideo.id)}
              className="
                btn-glimz-secondary
                text-xs xs:text-sm sm:text-base
                px-3 xs:px-4 sm:px-5
                py-2
                flex items-center justify-center
                min-w-[110px]
              "
            >
              <Info className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 mr-2" />
              More Info
            </Button>
          </div>

          {/* Audio Control */}
          <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="
                p-2 xs:p-2.5 sm:p-3
                rounded-full
                bg-white/10
                backdrop-blur-sm
                border border-white/20
                hover:bg-white/20
                flex items-center justify-center
              "
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
              )}
            </Button>
            <span className="text-white/60 text-xs xs:text-sm">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Only show if multiple videos */}
      {videoList.length > 1 && (
        <>
          <Button
            onClick={handlePrevious}
            variant="ghost"
            size="sm"
            className="
              absolute
              left-2 xs:left-4 sm:left-6 md:left-10
              top-1/2
              transform -translate-y-1/2
              z-30
              p-2 xs:p-2.5 sm:p-3
              rounded-full
              bg-white/10
              backdrop-blur-sm
              border border-white/20
              hover:bg-white/20
              flex items-center justify-center
            "
          >
            <ChevronLeft className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-white" />
          </Button>
          <Button
            onClick={handleNext}
            variant="ghost"
            size="sm"
            className="
              absolute
              right-2 xs:right-4 sm:right-6 md:right-10
              top-1/2
              transform -translate-y-1/2
              z-30
              p-2 xs:p-2.5 sm:p-3
              rounded-full
              bg-white/10
              backdrop-blur-sm
              border border-white/20
              hover:bg-white/20
              flex items-center justify-center
            "
          >
            <ChevronRight className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-white" />
          </Button>

          {/* Video Indicators */}
          <div className="
            absolute
            bottom-4 xs:bottom-6 sm:bottom-8
            left-1/2
            transform -translate-x-1/2
            z-30
            flex gap-2
          ">
            {videoList.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`
                  w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3
                  rounded-full
                  transition-all duration-300
                  ${index === currentIndex 
                    ? 'bg-white w-6 xs:w-8 sm:w-10' 
                    : 'bg-white/40 hover:bg-white/60'
                  }
                `}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Scroll Indicator - Only show if single video */}
      {videoList.length === 1 && (
        <div className="
          absolute
          bottom-2 xs:bottom-4 sm:bottom-8
          left-1/2
          transform -translate-x-1/2
          animate-bounce
          z-20
        ">
          <div className="w-4 h-7 xs:w-5 xs:h-8 sm:w-6 sm:h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-0.5 xs:w-1 h-2 xs:h-2.5 sm:h-3 bg-white/60 rounded-full mt-1 xs:mt-1.5 sm:mt-2 animate-pulse" />
          </div>
        </div>
      )}
    </section>
  );
};
