"use client"

import { Skeleton } from '@/components/ui/skeleton';

export const HeroBannerSkeleton = () => {
  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] overflow-hidden bg-background">
      {/* Main Image Skeleton */}
      <Skeleton className="absolute inset-0 w-full h-full" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      
      {/* Content Skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12 lg:p-16 space-y-4 sm:space-y-6">
        {/* Title Skeleton */}
        <div className="space-y-3 max-w-2xl">
          <Skeleton className="h-8 sm:h-10 md:h-12 w-3/4" />
          <Skeleton className="h-6 sm:h-8 w-1/2" />
        </div>
        
        {/* Description Skeleton */}
        <div className="space-y-2 max-w-xl">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        
        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="h-12 w-32 rounded-md" />
          <Skeleton className="h-12 w-32 rounded-md" />
        </div>
        
        {/* Meta Info Skeleton */}
        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>
      
      {/* Navigation Arrows Skeleton (if multiple videos) */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  );
};
