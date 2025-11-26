"use client";

import { useState } from "react";
import { User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export const CreatorCard = ({ creator, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick(creator);
    } else {
      // Default: navigate to creator profile
      router.push(`/profile/${creator.id}`);
    }
  };

  const getInitials = () => {
    const firstName = creator.first_name || "";
    const lastName = creator.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  };

  const fullName = `${creator.first_name || ""} ${creator.last_name || ""}`.trim();

  return (
    <div
      className="creator-card group relative w-full max-w-sm cursor-pointer transition-transform duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="relative w-full overflow-hidden rounded-lg bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/10">
        <div className="p-6">
          {/* Creator Info */}
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 border-2 border-white/20">
              <AvatarImage
                src={creator.profile_image}
                alt={fullName}
                onLoad={() => setImageLoaded(true)}
                className={imageLoaded ? "opacity-100" : "opacity-0"}
              />
              <AvatarFallback className="bg-glimz-primary/20 text-glimz-primary text-lg font-semibold">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-full" />
                )}
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg leading-tight truncate">
                {fullName || "Unknown Creator"}
              </h3>
              {creator.username && (
                <p className="text-white/60 text-sm truncate">@{creator.username}</p>
              )}
            </div>
          </div>

          {/* Score Badge */}
          {creator.score !== undefined && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span className="px-2 py-1 bg-white/10 rounded text-white/90 font-medium">
                  Relevance: {creator.score.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Highlights */}
          {creator.highlight && Object.keys(creator.highlight).length > 0 && (
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isHovered ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="space-y-1">
                {Object.entries(creator.highlight).map(([key, values], idx) => (
                  <div key={idx} className="text-xs text-white/70">
                    {Array.isArray(values) && values.length > 0 && (
                      <p className="line-clamp-2">
                        {values[0].replace(/<[^>]*>/g, "")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div
            className={`transition-all duration-300 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-200"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

