"use client"

import { Skeleton } from '@/components/ui/skeleton';

export const VideoCarouselSkeleton = ({ 
  title,
  size = 'medium'
}) => {
  // Number of skeleton cards to show
  const skeletonCount = 5;

  return (
    <section className="carousel-container py-4 sm:py-6 md:py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Skeleton className="h-8 w-48 sm:h-10 sm:w-64" />
        
        {/* Navigation Buttons Skeleton */}
        <div className="hidden sm:flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Video Cards Skeleton */}
      <div className="relative">
        <div
          className="carousel-track pb-2 sm:pb-4"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <div key={index} className="carousel-item">
              <div className={`video-card-skeleton relative ${size === 'small' ? 'w-96 h-56' : size === 'medium' ? 'w-96 h-56' : 'w-96 h-56'} flex-shrink-0`}>
                {/* Thumbnail Skeleton */}
                <Skeleton className="w-full h-full rounded-lg bg-gray-800" />
                
                {/* Overlay Content Skeleton */}
                <div className="absolute inset-0 flex flex-col justify-between p-3">
                  {/* Top badges skeleton */}
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-16 rounded-full bg-gray-700" />
                    <Skeleton className="h-6 w-16 rounded-md bg-gray-700" />
                  </div>
                  
                  {/* Bottom content skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-gray-700" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20 rounded-full bg-gray-700" />
                      <Skeleton className="h-4 w-16 rounded-full bg-gray-700" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
