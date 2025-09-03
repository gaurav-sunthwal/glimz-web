"use client"

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search as SearchIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VideoCard } from '@/components/VideoCard';
import { useAppStore } from '../store/appStore';
import videosData from '@/data/videos.json';

function SearchComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const { 
    searchQuery, 
    searchResults, 
    isSearching, 
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    setSearchQuery, 
    setSearchResults, 
    setIsSearching,
    clearSearch 
  } = useAppStore();

  const [localQuery, setLocalQuery] = useState(initialQuery);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    // Simulate API delay
    setTimeout(() => {
      const filtered = videosData.filter(video => 
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.description.toLowerCase().includes(query.toLowerCase()) ||
        video.genre.some(g => g.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  useEffect(() => {
    if (initialQuery) {
      setLocalQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleInputChange = (value) => {
    setLocalQuery(value);
    if (value.trim()) {
      handleSearch(value);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    clearSearch();
  };

  const handleWatchlistToggle = (videoId) => {
    if (watchlist.includes(videoId)) {
      removeFromWatchlist(videoId);
    } else {
      addToWatchlist(videoId);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const handlePlayVideo = (videoId) => {
    router.push(`/video/${videoId}`);
  };

  const handleViewDetails = (videoId) => {
    router.push(`/video/${videoId}`);
  };

  const genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Romance', 'Fantasy', 'Horror'];

  return (
    <div className="min-h-screen bg-background text-white pt-16 sm:pt-20">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 self-start sm:self-auto"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          
          {/* Search Input */}
          <div className="flex-1 relative max-w-2xl">
            <SearchIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-foreground-muted" />
            <Input
              type="text"
              placeholder="Search for movies, shows, genres..."
              value={localQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              className="search-input pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 text-base sm:text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60"
              autoFocus
            />
            {localQuery && (
              <Button
                onClick={handleClearSearch}
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 rounded-full hover:bg-white/10"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {!localQuery ? (
          // Initial State - Show Genre Categories
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Browse by Genre</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    onClick={() => handleInputChange(genre)}
                    className="btn-glimz-secondary h-16 sm:h-20 text-sm sm:text-lg font-medium"
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Popular Searches</h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {['Action Movies', 'Sci-Fi Series', 'Comedy Shows', 'Drama Films', 'Thriller Movies'].map((term) => (
                  <Button
                    key={term}
                    onClick={() => handleInputChange(term.split(' ')[0])}
                    variant="outline"
                    className="btn-glimz-ghost border-white/20 hover:border-glimz-primary text-sm sm:text-base"
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : isSearching ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-glimz-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-foreground-muted text-sm sm:text-base">Searching for "{localQuery}"...</p>
          </div>
        ) : searchResults.length === 0 ? (
          // No Results State
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <SearchIcon className="h-10 w-10 sm:h-12 sm:w-12 text-white/40" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">No results found</h2>
            <p className="text-foreground-muted mb-6 sm:mb-8 max-w-md text-sm sm:text-base">
              We couldn&apos;t find anything matching &quot;{localQuery}&quot;. Try adjusting your search or browse our popular genres.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              {genres.slice(0, 4).map((genre) => (
                <Button
                  key={genre}
                  onClick={() => handleInputChange(genre)}
                  className="btn-glimz-secondary text-sm sm:text-base"
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // Results State
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                Search Results for &quot;{localQuery}&quot;
              </h2>
              <p className="text-foreground-muted text-sm sm:text-base">
                {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
              </p>
            </div>
            
            <div className=" flex flex-wrap justify-start gap-5">
              {searchResults.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={handlePlayVideo}
                  onAddToList={handleWatchlistToggle}
                  onViewDetails={handleViewDetails}
                  isInWatchlist={watchlist.includes(video.id)}
                  size="large"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchComponent />
    </Suspense>
  );
}
