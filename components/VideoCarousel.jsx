"use client"

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCard } from './VideoCard';

export const VideoCarousel = ({ 
  title, 
  videos, 
  onPlay, 
  onAddToList, 
  onViewDetails,
  watchlist = [],
  size = 'medium'
}) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = size === 'small' ? 200 : size === 'medium' ? 280 : 340;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <section className="carousel-container py-4 sm:py-6 md:py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
       <h2 className="w-[95%] mt-3 mx-auto text-[17px] font-semibold font-lexend text-white md:pb-3 md:text-[30px]">{title}</h2>
        
        {/* Navigation Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Video Cards */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="carousel-track pb-2 sm:pb-4"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {videos.map((video) => (
            <div key={video.id} className="carousel-item">
              <VideoCard
                video={video}
                onPlay={onPlay}
                onAddToList={onAddToList}
                onViewDetails={onViewDetails}
                isInWatchlist={watchlist.includes(video.id)}
                size={size}
                isPaid={video.isPaid}
              />
            </div>
          ))}
        </div>

        {/* Gradient Fade Effects */}
        {/* <div className="absolute top-0 left-0 w-8 sm:w-16 h-full bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-8 sm:w-16 h-full bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
         */}
        {/* Mobile Navigation Dots */}
        {/* <div className="sm:hidden flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(videos.length / 2) }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollContainerRef.current) {
                  const scrollAmount = size === 'small' ? 200 : size === 'medium' ? 280 : 340;
                  scrollContainerRef.current.scrollTo({
                    left: index * scrollAmount,
                    behavior: 'smooth'
                  });
                }
              }}
              className="w-2 h-2 rounded-full bg-white/30 hover:bg-white/60 transition-colors"
            />
          ))}
        </div> */}
      </div>
    </section>
  );
};
