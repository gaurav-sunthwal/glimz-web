"use client"

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search as SearchIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VideoCard } from '@/components/VideoCard';
import { CreatorCard } from '@/components/CreatorCard';
import { useAppStore } from '../store/appStore';

function SearchComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';
  
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
  const [searchType, setSearchType] = useState(initialType);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  const [apiResponse, setApiResponse] = useState(null);

  const handleSearch = useCallback(async (query, type = 'all', pageNum = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setTotalResults(0);
      setApiResponse(null);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    try {
      const queryParams = new URLSearchParams({
        q: query.trim(),
        type: type,
        page: pageNum.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/search?${queryParams.toString()}`);
      const data = await response.json();

      if (data.status && data.data) {
        setApiResponse(data.data);
        setTotalResults(data.data.total || 0);
        
        // Transform API results to match component expectations
        const transformedResults = data.data.results.map(result => {
          if (result.type === 'content') {
            // Transform content result to match VideoCard expectations
            return {
              id: result.id,
              title: result.title,
              description: result.description,
              thumbnail: result.thumbnail,
              video: result.video,
              teaser: result.teaser,
              creator_id: result.creator_id,
              created_at: result.created_at,
              score: result.score,
              highlight: result.highlight,
              // Add default values for VideoCard
              duration: 'N/A',
              genre: [],
              releaseYear: new Date(result.created_at).getFullYear(),
              rating: null,
              views: null,
              likes: null,
              isLive: false,
            };
          } else {
            // Creator result - already matches CreatorCard expectations
            return result;
          }
        });
        
        setSearchResults(transformedResults);
      } else {
        setSearchResults([]);
        setTotalResults(0);
        setApiResponse(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalResults(0);
      setApiResponse(null);
    } finally {
      setIsSearching(false);
    }
  }, [limit, setSearchQuery, setSearchResults, setIsSearching]);

  useEffect(() => {
    if (initialQuery) {
      setLocalQuery(initialQuery);
      setSearchType(initialType);
      handleSearch(initialQuery, initialType, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, initialType]);

  const handleInputChange = (value) => {
    setLocalQuery(value);
    setPage(1); // Reset to first page on new search
    if (value.trim()) {
      handleSearch(value, searchType, 1);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      setTotalResults(0);
      setApiResponse(null);
    }
  };

  const handleTypeChange = (type) => {
    setSearchType(type);
    setPage(1); // Reset to first page when changing type
    if (localQuery.trim()) {
      handleSearch(localQuery, type, 1);
    }
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    setPage(1);
    clearSearch();
    setTotalResults(0);
    setApiResponse(null);
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

  const handleCreatorClick = (creator) => {
    router.push(`/profile/${creator.id}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (localQuery.trim()) {
      handleSearch(localQuery, searchType, newPage);
    }
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalResults / limit);
  const genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Romance', 'Fantasy', 'Horror'];
  
  // Separate content and creator results
  const contentResults = searchResults.filter(r => r.type === 'content' || (!r.type && r.title));
  const creatorResults = searchResults.filter(r => r.type === 'creator');

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
            <p className="text-foreground-muted text-sm sm:text-base">Searching for &quot;{localQuery}&quot;...</p>
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
            {/* Header with Type Filter */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">
                  Search Results for &quot;{localQuery}&quot;
                </h2>
                <p className="text-foreground-muted text-sm sm:text-base">
                  {totalResults} {totalResults === 1 ? 'result' : 'results'} found
                </p>
              </div>
              
              {/* Type Filter Tabs */}
              <div className="flex gap-2 border-b border-white/10">
                {['all', 'content', 'creator'].map((type) => (
                  <Button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    variant="ghost"
                    className={`px-4 py-2 rounded-t-lg border-b-2 transition-all ${
                      searchType === type
                        ? 'border-glimz-primary text-glimz-primary bg-glimz-primary/10'
                        : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Content Results */}
            {contentResults.length > 0 && (searchType === 'all' || searchType === 'content') && (
              <div className="space-y-4">
                {searchType === 'all' && (
                  <h3 className="text-lg font-semibold text-white/90">Content</h3>
                )}
                <div className="flex flex-wrap justify-start gap-5">
                  {contentResults.map((video) => (
                    <VideoCard
                      key={`content-${video.id}`}
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

            {/* Creator Results */}
            {creatorResults.length > 0 && (searchType === 'all' || searchType === 'creator') && (
              <div className="space-y-4">
                {searchType === 'all' && (
                  <h3 className="text-lg font-semibold text-white/90">Creators</h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {creatorResults.map((creator) => (
                    <CreatorCard
                      key={`creator-${creator.id}`}
                      creator={creator}
                      onClick={handleCreatorClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        variant={page === pageNum ? "default" : "ghost"}
                        className={`min-w-[40px] ${
                          page === pageNum
                            ? 'bg-glimz-primary text-white'
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
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
