import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCard } from './VideoCard';

interface Video {
  id: string;
  title: string;
  shortDescription: string;
  thumbnail: string;
  genre: string[];
  likes: number;
  duration: string;
  releaseYear: number;
  rating: string;
}

interface VideoCarouselProps {
  title: string;
  videos: Video[];
  onPlay?: (videoId: string) => void;
  onAddToList?: (videoId: string) => void;
  onViewDetails?: (videoId: string) => void;
  watchlist?: string[];
  size?: 'small' | 'medium' | 'large';
}

export const VideoCarousel = ({ 
  title, 
  videos, 
  onPlay, 
  onAddToList, 
  onViewDetails,
  watchlist = [],
  size = 'medium'
}: VideoCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
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
    <section className="carousel-container py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          {title}
        </h2>
        
        {/* Navigation Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Video Cards */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="carousel-track pb-4"
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
              />
            </div>
          ))}
        </div>

        {/* Gradient Fade Effects */}
        <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
};