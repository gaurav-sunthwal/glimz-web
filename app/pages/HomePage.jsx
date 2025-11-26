"use client"

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { VideoCarousel } from '@/components/VideoCarousel';
import { VideoDetails } from '../pages/VideoDetails';
import { Search } from '../pages/Search';
import { useAppStore } from '../store/appStore';
import videosData from '@/data/videos.json'
import { getVideoWithPlaceholders } from '../utils/updateVideoData';
import { useIsMobile } from '../hooks/use-Mobile';

const HomePage = () => {
  const { 
    currentPage, 
    watchlist, 
    addToWatchlist, 
    removeFromWatchlist, 
    setCurrentPage 
  } = useAppStore();
  
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [continueWatching, setContinueWatching] = useState([]);
  const [isLoadingContinueWatching, setIsLoadingContinueWatching] = useState(true);
  const [purchasedContent, setPurchasedContent] = useState([]);
  const [isLoadingPurchasedContent, setIsLoadingPurchasedContent] = useState(true);
  const isMobile =  useIsMobile();
  // Get videos with consistent placeholder images
  const videos = getVideoWithPlaceholders();
  
  // Get featured video for hero banner
  const featuredVideo = videos.find(v => v.featured) || videos[0];

  // Fetch continue watching data
  useEffect(() => {
    const fetchContinueWatching = async () => {
      try {
        setIsLoadingContinueWatching(true);
        const response = await fetch('/api/user/continue-watching', {
          method: 'GET',
          credentials: 'include',
        });
        
        const data = await response.json();
        console.log(data);
        if (data.status && data.result && Array.isArray(data.result)) {
          // Transform API response to match VideoCard format
          const transformedVideos = data.result.map((item) => {
            // Handle nested content properties (they come as "content.title", "content.thumbnail", etc.)
            const contentTitle = item['content.title'] || item.title;
            const contentThumbnail = item['content.thumbnail'];
            const thumbnailUrl = contentThumbnail?.url || contentThumbnail || '';
            const contentVideo = item['content.video'];
            const contentTeaser = item['content.teaser'];
            const contentCreatedAt = item['content.created_at'] || item.created_at;
            
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
              description: `Continue watching from ${Math.round(item.percentage_watched || 0)}%`,
              genre: [],
              releaseYear: contentCreatedAt ? new Date(contentCreatedAt).getFullYear() : new Date().getFullYear(),
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
        console.error('Error fetching continue watching:', error);
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
        const response = await fetch('/api/user/purchased-content', {
          method: 'GET',
          credentials: 'include',
        });
        
        const data = await response.json();
        console.log('Purchased content data:', data);
        
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
              const thumbnailUrl = subscription.thumbnail?.url || subscription.thumbnail || '';
              
              return {
                id: subscription.content_id,
                title: subscription.title || 'Purchased Content',
                thumbnail: thumbnailUrl,
                video: subscription.video,
                teaser: subscription.teaser,
                description: subscription.description || 'Your purchased content',
                playlist_id: subscription.playlist_id,
                subscription_id: subscription.subscription_id,
                subscription_on: subscription.subscription_on,
                subscription_till: subscription.subscription_till,
                // Add default values for VideoCard
                genre: [],
                releaseYear: subscription.subscription_on ? new Date(subscription.subscription_on).getFullYear() : new Date().getFullYear(),
                rating: null,
                views: null,
                likes: null,
                isLive: false,
                is_paid: true,
                isPurchased: true, // Flag to identify purchased content
                duration: 'N/A', // Duration not provided in subscription data
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
        console.error('Error fetching purchased content:', error);
        setPurchasedContent([]);
      } finally {
        setIsLoadingPurchasedContent(false);
      }
    };

    fetchPurchasedContent();
  }, []);

  // Helper function to format duration
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setCurrentVideoId(null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage('/search');
  };

  const handlePlayVideo = (videoId) => {
    // In a real app, this would open a video player
    console.log('Playing video:', videoId);
    // For now, just navigate to video details
    setCurrentVideoId(videoId);
    setCurrentPage('/video');
  };

  const handleViewDetails = (videoId) => {
    setCurrentVideoId(videoId);
    setCurrentPage('/video');
  };

  const handleWatchlistToggle = (videoId) => {
    if (watchlist.includes(videoId)) {
      removeFromWatchlist(videoId);
    } else {
      addToWatchlist(videoId);
    }
  };

  // Render different pages based on current route
  if (currentPage === '/video' && currentVideoId) {
    return (
      <VideoDetails
        videoId={currentVideoId}
        onBack={() => setCurrentPage('/')}
        onPlay={handlePlayVideo}
      />
    );
  }

 

  if (currentPage === '/search') {
    return (
      <Search
        onBack={() => setCurrentPage('/')}
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
      <Header 
        onSearch={handleSearch}
      />

      {/* Hero Banner */}
      <HeroBanner
        video={featuredVideo}
        onPlay={handlePlayVideo}
        onMoreInfo={handleViewDetails}
      />

      {/* Content Sections */}
      <div className="relative z-10 ">
        {/* Continue Watching Section */}
        {!isLoadingContinueWatching && continueWatching.length > 0 && (
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
        )}

        {/* Purchased Content Section */}
        {!isLoadingPurchasedContent && purchasedContent.length > 0 && (
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
        )}
      </div>

      {/* Footer Spacing */}
      <div className="h-20" />
    </div>
  );
};

export default HomePage;
