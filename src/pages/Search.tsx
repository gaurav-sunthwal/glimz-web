import { useState, useEffect } from 'react';
import { ArrowLeft, Search as SearchIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VideoCard } from '@/components/VideoCard';
import { useAppStore } from '@/store/appStore';
import videosData from '@/data/videos.json';

interface SearchProps {
  onBack: () => void;
  onPlay: (videoId: string) => void;
  onViewDetails: (videoId: string) => void;
  initialQuery?: string;
}

export const Search = ({ onBack, onPlay, onViewDetails, initialQuery = '' }: SearchProps) => {
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

  const [localQuery, setLocalQuery] = useState(initialQuery || searchQuery);

  useEffect(() => {
    if (initialQuery) {
      setLocalQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (query: string) => {
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

  const handleInputChange = (value: string) => {
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

  const handleWatchlistToggle = (videoId: string) => {
    if (watchlist.includes(videoId)) {
      removeFromWatchlist(videoId);
    } else {
      addToWatchlist(videoId);
    }
  };

  const genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Romance', 'Fantasy', 'Horror'];

  return (
    <div className="min-h-screen bg-background text-white pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          
          {/* Search Input */}
          <div className="flex-1 relative max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-muted" />
            <Input
              type="text"
              placeholder="Search for movies, shows, genres..."
              value={localQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              className="search-input pl-12 pr-12 py-4 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60"
              autoFocus
            />
            {localQuery && (
              <Button
                onClick={handleClearSearch}
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {!localQuery ? (
          // Initial State - Show Genre Categories
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Browse by Genre</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    onClick={() => handleInputChange(genre)}
                    className="btn-glimz-secondary h-20 text-lg font-medium"
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Popular Searches</h2>
              <div className="flex flex-wrap gap-3">
                {['Action Movies', 'Sci-Fi Series', 'Comedy Shows', 'Drama Films', 'Thriller Movies'].map((term) => (
                  <Button
                    key={term}
                    onClick={() => handleInputChange(term.split(' ')[0])}
                    variant="outline"
                    className="btn-glimz-ghost border-white/20 hover:border-glimz-primary"
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : isSearching ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-glimz-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-foreground-muted">Searching for "{localQuery}"...</p>
          </div>
        ) : searchResults.length === 0 ? (
          // No Results State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <SearchIcon className="h-12 w-12 text-white/40" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">No results found</h2>
            <p className="text-foreground-muted mb-8 max-w-md">
              We couldn't find anything matching "{localQuery}". Try adjusting your search or browse our popular genres.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {genres.slice(0, 4).map((genre) => (
                <Button
                  key={genre}
                  onClick={() => handleInputChange(genre)}
                  className="btn-glimz-secondary"
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // Results State
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Search Results for "{localQuery}"
              </h2>
              <p className="text-foreground-muted">
                {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {searchResults.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={onPlay}
                  onAddToList={handleWatchlistToggle}
                  onViewDetails={onViewDetails}
                  isInWatchlist={watchlist.includes(video.id)}
                  size="small"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};