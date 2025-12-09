"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { HeroBannerSkeleton } from "@/components/HeroBannerSkeleton";
import { VideoCarousel } from "@/components/VideoCarousel";
import { VideoCarouselSkeleton } from "@/components/VideoCarouselSkeleton";
import { VideoDetails } from "../pages/VideoDetails";
import { Search } from "../pages/Search";
import { useAppStore } from "../store/appStore";
import videosData from "@/data/videos.json";
import { getVideoWithPlaceholders } from "../utils/updateVideoData";
import { useIsMobile } from "../hooks/use-Mobile";

const HomePage = () => {
  const router = useRouter();
  const {
    currentPage,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    setCurrentPage,
  } = useAppStore();

  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [continueWatching, setContinueWatching] = useState([]);
  const [isLoadingContinueWatching, setIsLoadingContinueWatching] =
    useState(true);
  const [purchasedContent, setPurchasedContent] = useState([]);
  const [isLoadingPurchasedContent, setIsLoadingPurchasedContent] =
    useState(true);
  const [trendingContent, setTrendingContent] = useState([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [trendingBannerVideos, setTrendingBannerVideos] = useState([]);
  const [isLoadingBannerVideos, setIsLoadingBannerVideos] = useState(true);
  const isMobile = useIsMobile();
  // Get videos with consistent placeholder images
  const videos = getVideoWithPlaceholders();

  // Get featured video for hero banner (fallback)
  const featuredVideo = videos.find((v) => v.featured) || videos[0];

  // Fetch continue watching data
  useEffect(() => {
    const fetchContinueWatching = async () => {
      try {
        setIsLoadingContinueWatching(true);
        const response = await fetch(
          "http://api.glimznow.com/api/user/continue-watching",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();
        console.log("Continue watching response:", data);
        console.log("Continue watching data:", data);
        if (data.status && data.result && Array.isArray(data.result)) {
          // Transform API response to match VideoCard format
          const transformedVideos = data.result.map((item) => {
            // Handle nested content properties (they come as "content.title", "content.thumbnail", etc.)
            const contentTitle = item["content.title"] || item.title;
            const contentThumbnail = item["content.thumbnail"];
            const thumbnailUrl =
              contentThumbnail?.url || contentThumbnail || "";
            const contentVideo = item["content.video"];
            const contentTeaser = item["content.teaser"];
            const contentCreatedAt =
              item["content.created_at"] || item.created_at;

            return {
              id: item.content_id,
              title: contentTitle,
              thumbnail: thumbnailUrl,
              video: contentVideo,
              teaser: contentTeaser,
              creator_id: item.creator_id,
              duration: formatDuration(item.total_duration),
              duration_watched: item.duration_watched,
              total_duration: item.total_duration,
              progress_percentage: item.percentage_watched,
              last_watched_at: item.last_watched_at,
              is_completed: item.is_completed,
              is_paid: item.is_paid,
              price: item.price,
              // Add default values for VideoCard
              description: `Continue watching from ${Math.round(
                item.percentage_watched || 0
              )}%`,
              genre: [],
              releaseYear: contentCreatedAt
                ? new Date(contentCreatedAt).getFullYear()
                : new Date().getFullYear(),
              rating: null,
              views: null,
              likes: null,
              isLive: false,
              isContinueWatching: true, // Flag to identify continue watching items
            };
          });

          setContinueWatching(transformedVideos);
        } else {
          setContinueWatching([]);
        }
      } catch (error) {
        console.error("Error fetching continue watching:", error);
        setContinueWatching([]);
      } finally {
        setIsLoadingContinueWatching(false);
      }
    };

    fetchContinueWatching();
  }, []);

  // Fetch purchased content data
  useEffect(() => {
    const fetchPurchasedContent = async () => {
      try {
        setIsLoadingPurchasedContent(true);
        const response = await fetch(
          "http://api.glimznow.com/api/user/purchased-content",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.status && data.data && Array.isArray(data.data)) {
          // Flatten subscriptions from all data items
          const allSubscriptions = [];

          data.data.forEach((item) => {
            if (item.subscriptions && Array.isArray(item.subscriptions)) {
              allSubscriptions.push(...item.subscriptions);
            }
          });

          if (allSubscriptions.length > 0) {
            // Transform API response to match VideoCard format
            const transformedVideos = allSubscriptions.map((subscription) => {
              const thumbnailUrl =
                subscription.thumbnail?.url || subscription.thumbnail || "";

              return {
                id: subscription.content_id,
                title: subscription.title || "Purchased Content",
                thumbnail: thumbnailUrl,
                video: subscription.video,
                teaser: subscription.teaser,
                description:
                  subscription.description || "Your purchased content",
                playlist_id: subscription.playlist_id,
                subscription_id: subscription.subscription_id,
                subscription_on: subscription.subscription_on,
                subscription_till: subscription.subscription_till,
                // Add default values for VideoCard
                genre: [],
                releaseYear: subscription.subscription_on
                  ? new Date(subscription.subscription_on).getFullYear()
                  : new Date().getFullYear(),
                rating: null,
                views: null,
                likes: null,
                isLive: false,
                is_paid: true,
                isPurchased: true, // Flag to identify purchased content
                duration: "N/A", // Duration not provided in subscription data
              };
            });

            setPurchasedContent(transformedVideos);
          } else {
            setPurchasedContent([]);
          }
        } else {
          setPurchasedContent([]);
        }
      } catch (error) {
        console.error("Error fetching purchased content:", error);
        setPurchasedContent([]);
      } finally {
        setIsLoadingPurchasedContent(false);
      }
    };

    fetchPurchasedContent();
  }, []);

  // Fetch trending content for banner (top 5)
  useEffect(() => {
    const fetchTrendingBannerContent = async () => {
      try {
        setIsLoadingBannerVideos(true);
        const response = await fetch(
          "http://api.glimznow.com/api/content?page=1&limit=5",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.status && data.data && Array.isArray(data.data)) {
          // Transform API response to match HeroBanner format
          const transformedVideos = data.data.slice(0, 5).map((item) => {
            const thumbnailUrl = item.thumbnail?.url || item.thumbnail || "";

            return {
              id: item.content_id,
              title: item.title || "Untitled",
              thumbnail: thumbnailUrl,
              heroImage: thumbnailUrl, // Use thumbnail as hero image
              video: item.video,
              teaser: item.teaser,
              description: item.description || "",
              creator_id: item.creator_id,
              creator_name: item.creator_name,
              username: item.username,
              is_paid: item.is_paid,
              price: item.price,
              views_count: item.views_count,
              likes_count: item.likes_count,
              comment_count: item.comment_count,
              playlist_id: item.playlist_id,
              created_at: item.created_at,
              // Add default values for HeroBanner
              genre: [],
              releaseYear: item.created_at
                ? new Date(item.created_at).getFullYear()
                : new Date().getFullYear(),
              rating: null,
              views: item.views_count ? `${item.views_count} views` : null,
              likes: item.likes_count ? `${item.likes_count} likes` : null,
              isLive: false,
              duration: "N/A", // Duration not provided in API response
            };
          });

          setTrendingBannerVideos(transformedVideos);
        } else {
          setTrendingBannerVideos([]);
        }
      } catch (error) {
        console.error("Error fetching trending banner content:", error);
        setTrendingBannerVideos([]);
      } finally {
        setIsLoadingBannerVideos(false);
      }
    };

    fetchTrendingBannerContent();
  }, []);

  // Fetch trending content for carousel
  useEffect(() => {
    const fetchTrendingContent = async () => {
      try {
        setIsLoadingTrending(true);
        const response = await fetch(
          "http://api.glimznow.com/api/content?page=1&limit=20",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.status && data.data && Array.isArray(data.data)) {
          // Transform API response to match VideoCard format
          const transformedVideos = data.data.map((item) => {
            const thumbnailUrl = item.thumbnail?.url || item.thumbnail || "";

            return {
              id: item.content_id,
              title: item.title || "Untitled",
              thumbnail: thumbnailUrl,
              video: item.video,
              teaser: item.teaser,
              description: item.description || "",
              creator_id: item.creator_id,
              creator_name: item.creator_name,
              username: item.username,
              is_paid: item.is_paid,
              price: item.price,
              views_count: item.views_count,
              likes_count: item.likes_count,
              comment_count: item.comment_count,
              playlist_id: item.playlist_id,
              created_at: item.created_at,
              // Add default values for VideoCard
              genre: [],
              releaseYear: item.created_at
                ? new Date(item.created_at).getFullYear()
                : new Date().getFullYear(),
              rating: null,
              views: item.views_count ? `${item.views_count} views` : null,
              likes: item.likes_count ? `${item.likes_count} likes` : null,
              isLive: false,
              duration: "N/A", // Duration not provided in API response
            };
          });

          setTrendingContent(transformedVideos);
        } else {
          setTrendingContent([]);
        }
      } catch (error) {
        console.error("Error fetching trending content:", error);
        setTrendingContent([]);
      } finally {
        setIsLoadingTrending(false);
      }
    };

    fetchTrendingContent();
  }, []);

  // Helper function to format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setCurrentVideoId(null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage("/search");
  };

  const handlePlayVideo = (videoId) => {
    // In a real app, this would open a video player
    // For now, just navigate to video details
    setCurrentVideoId(videoId);
    setCurrentPage("/video");
  };

  const handleViewDetails = (videoId) => {
    // Navigate to video details page
    router.push(`/video/${videoId}`);
  };

  const handleWatchlistToggle = (videoId) => {
    if (watchlist.includes(videoId)) {
      removeFromWatchlist(videoId);
    } else {
      addToWatchlist(videoId);
    }
  };

  // Render different pages based on current route
  if (currentPage === "/video" && currentVideoId) {
    return (
      <VideoDetails
        videoId={currentVideoId}
        onBack={() => setCurrentPage("/")}
        onPlay={handlePlayVideo}
      />
    );
  }

  if (currentPage === "/search") {
    return (
      <Search
        onBack={() => setCurrentPage("/")}
        onPlay={handlePlayVideo}
        onViewDetails={handleViewDetails}
        initialQuery={searchQuery}
      />
    );
  }

  // Mobile: Show explore page as home, Desktop/Tablet: Show normal home page

  // Desktop/Tablet: Normal home page
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onSearch={handleSearch} />

      {/* Hero Banner */}
      {isLoadingBannerVideos ? (
        <HeroBannerSkeleton />
      ) : trendingBannerVideos.length > 0 ? (
        <HeroBanner
          videos={trendingBannerVideos}
          onPlay={handlePlayVideo}
          onMoreInfo={handleViewDetails}
        />
      ) : (
        <HeroBanner
          video={featuredVideo}
          onPlay={handlePlayVideo}
          onMoreInfo={handleViewDetails}
        />
      )}

      {/* Content Sections */}
      <div className="relative z-10 ">
        {/* Trending Now Section */}
        {isLoadingTrending ? (
          <VideoCarouselSkeleton
            title="Trending Now"
            size={isMobile ? "medium" : "large"}
          />
        ) : (
          trendingContent.length > 0 && (
            <VideoCarousel
              key="Trending Now"
              title="Trending Now"
              videos={trendingContent}
              onPlay={handlePlayVideo}
              onAddToList={handleWatchlistToggle}
              onViewDetails={handleViewDetails}
              watchlist={watchlist}
              size={isMobile ? "medium" : "large"}
            />
          )
        )}

        {/* Continue Watching Section */}
        {isLoadingContinueWatching ? (
          <VideoCarouselSkeleton
            title="Continue Watching"
            size={isMobile ? "medium" : "large"}
          />
        ) : (
          continueWatching.length > 0 && (
            <VideoCarousel
              key="Continue Watching"
              title="Continue Watching"
              videos={continueWatching}
              onPlay={handlePlayVideo}
              onAddToList={handleWatchlistToggle}
              onViewDetails={handleViewDetails}
              watchlist={watchlist}
              size={isMobile ? "medium" : "large"}
            />
          )
        )}

        {/* Purchased Content Section */}
        {isLoadingPurchasedContent ? (
          <VideoCarouselSkeleton
            title="Purchased Content"
            size={isMobile ? "medium" : "large"}
          />
        ) : (
          purchasedContent.length > 0 && (
            <VideoCarousel
              key="Purchased Content"
              title="Purchased Content"
              videos={purchasedContent}
              onPlay={handlePlayVideo}
              onAddToList={handleWatchlistToggle}
              onViewDetails={handleViewDetails}
              watchlist={watchlist}
              size={isMobile ? "medium" : "large"}
            />
          )
        )}
      </div>

      {/* Footer Spacing */}
      <div className="h-20" />
    </div>
  );
};

export default HomePage;
