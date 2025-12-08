"use client";

import { useState } from "react";
import { Play, Heart, Clock, ThumbsUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { WishlistDialog } from "./WishlistDialog";

export const VideoCard = ({
  video,
  onPlay,
  onAddToList,
  onViewDetails,
  isInWatchlist = false,
  size = "medium",
  isPaid,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showWishlistDialog, setShowWishlistDialog] = useState(false);

  const sizeClasses = {
    small: "w-96 h-56",
    medium: "w-96 h-56",
    large: "w-96 h-56",
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  const router = useRouter();
  const handleViewDetails = (videoId) => {
    router.push(`/video/${videoId}`);
  };

  // Format numbers with K/M suffixes
  const formatNumber = (num) => {
    if (!num && num !== 0) return "";
    const number = typeof num === "string" ? parseFloat(num.replace(/[^0-9.]/g, "")) : num;
    if (isNaN(number)) return num;
    
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    } else if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toString();
  };

  return (
    <div
      className={`video-card group relative ${sizeClasses[size]} flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-20`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        // Only navigate if clicking on the card itself, not on interactive elements
        if (e.target === e.currentTarget || !e.target.closest('button')) {
          handleViewDetails(video.id);
        }
      }}
    >
      {/* Main Card Container */}
      <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg" />
        )}

        {/* Thumbnail Image */}
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } ${isHovered ? "scale-110" : "scale-100"}`}
          onLoad={handleImageLoad}
          loading="lazy"
        />

        {/* Dark Overlay */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isHovered ? "bg-black/60" : "bg-black/30"
          }`}
        />

        {/* Duration Badge */}
        <div className="absolute top-3 right-3 bg-black/80 text-white text-sm px-3 py-1 rounded-md font-medium backdrop-blur-sm">
          {video.duration}
        </div>

        {/* Live Badge */}
        {video.isLive && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-sm px-3 py-1 rounded-md flex items-center gap-2 font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}

        {/* Genre Tags */}
        {video.genre && !video.isLive && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {video.genre.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-white/20 font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Play Button Overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
        >
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/watch/${video.id}`);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/30 hover:border-white/60 hover:scale-110 p-4 rounded-full transition-all duration-200 shadow-lg pointer-events-auto"
          >
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </Button>
        </div>

        {/* Content Overlay - Fixed Height */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4">
          {/* Title */}
          <div className="flex justify-between py-2">
            <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-2">
              {video.title}
            </h3>

            {(video.price || isPaid) && (
              <div className="flex items-center gap-1 bg-black/70 px-3 py-1 rounded-full">
                <span className="text-blue-400 text-xs font-semibold">
                  {video.price ? `₹${video.price}` : isPaid ? "Paid" : "Free"}
                </span>
              </div>
            )}
          </div>

          {/* Metadata Row */}
          <div className="flex items-center justify-between">
            {/* Left Side - Video Info */}
            <div className="flex items-center gap-2 text-xs text-white/90 overflow-hidden">
              {video.releaseYear && (
                <span className="font-medium whitespace-nowrap">
                  {video.releaseYear}
                </span>
              )}
              {video.rating && (
                <>
                  <span className="text-white/60">•</span>
                  <span className="px-2 py-1 bg-white/25 rounded text-white/95 text-xs font-medium whitespace-nowrap">
                    {video.rating}
                  </span>
                </>
              )}
              {video.views && (
                <>
                  <span className="text-white/60">•</span>
                  <span className="text-white/80 whitespace-nowrap">
                    {formatNumber(video.views)} views
                  </span>
                </>
              )}
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 relative z-50">
              {/* Likes */}
              {video.likes && (
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <ThumbsUp className="h-3 w-3" />
                  <span className="font-medium">
                    {typeof video.likes === "number" || (typeof video.likes === "string" && !video.likes.includes("%"))
                      ? formatNumber(video.likes)
                      : video.likes}
                  </span>
                </div>
              )}

              {/* Add to Watchlist Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isInWatchlist) {
                    // If already in watchlist, remove it
                    onAddToList?.(video.id);
                  } else {
                    // Show wishlist dialog to add to wishlist
                    setShowWishlistDialog(true);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`p-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 hover:bg-white/25 transition-all duration-200 relative z-50 ${
                  isInWatchlist
                    ? "text-red-400 bg-red-400/20 border-red-400/30"
                    : "text-white hover:text-red-400"
                } ${
                  isHovered ? "opacity-100 scale-100" : "opacity-70 scale-90"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isInWatchlist ? "fill-current" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* Description - Show on hover with smooth transition */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isHovered ? "max-h-16 opacity-100 mt-2" : "max-h-0 opacity-0"
            }`}
          >
            {video.description && (
              <p className="text-white/90 text-xs line-clamp-3 leading-relaxed">
                {video.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Wishlist Dialog */}
      <WishlistDialog
        open={showWishlistDialog}
        onOpenChange={setShowWishlistDialog}
        contentId={video.id}
        onSuccess={() => {
          // Optionally call onAddToList to update UI
          onAddToList?.(video.id);
        }}
      />
    </div>
  );
};
