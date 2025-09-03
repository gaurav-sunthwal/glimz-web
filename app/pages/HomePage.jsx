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
  const isMobile =  useIsMobile();
  // Get videos with consistent placeholder images
  const videos = getVideoWithPlaceholders();
  
  // Get featured video for hero banner
  const featuredVideo = videos.find(v => v.featured) || videos[0];

  // Organize videos by genre
  const genreCategories = [
    { title: 'Trending Now', videos: videos.slice(0, 8)  },
    { title: 'AI Picks for You', videos: videos.filter(v => v.likes >= 90) },
    { title: 'Sci-Fi Adventures', videos: videos.filter(v => v.genre.includes('Sci-Fi')) },
    { title: 'Drama Collection', videos: videos.filter(v => v.genre.includes('Drama')) },
    { title: 'Action & Thrills', videos: videos.filter(v => v.genre.includes('Action') || v.genre.includes('Thriller')) },
    { title: 'Feel Good Movies', videos: videos.filter(v => v.genre.includes('Comedy') || v.genre.includes('Romance')) },
  ];

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
        {genreCategories.map((category) => (
          category.videos.length > 0 && (
            <VideoCarousel
              key={category.title}
              title={category.title}
              videos={category.videos}
              onPlay={handlePlayVideo}
              onAddToList={handleWatchlistToggle}
              onViewDetails={handleViewDetails}
              watchlist={watchlist}
              size=  {isMobile ? "medium" : "large"}
        
            />
          )
        ))}
      </div>

      {/* Footer Spacing */}
      <div className="h-20" />
    </div>
  );
};

export default HomePage;
