import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Video {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  heroImage: string;
  genre: string[];
  likes: number;
  duration: string;
  releaseYear: number;
  rating: string;
  videoUrl: string;
  featured?: boolean;
}

interface AppState {
  // Search
  searchQuery: string;
  searchResults: Video[];
  isSearching: boolean;
  
  // Watchlist
  watchlist: string[];
  
  // Current page
  currentPage: string;
  currentVideo: Video | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Video[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  addToWatchlist: (videoId: string) => void;
  removeFromWatchlist: (videoId: string) => void;
  setCurrentPage: (page: string) => void;
  setCurrentVideo: (video: Video | null) => void;
  clearSearch: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      watchlist: [],
      currentPage: '/',
      currentVideo: null,

      // Actions
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      
      setSearchResults: (results: Video[]) => set({ searchResults: results }),
      
      setIsSearching: (isSearching: boolean) => set({ isSearching }),
      
      addToWatchlist: (videoId: string) => {
        const { watchlist } = get();
        if (!watchlist.includes(videoId)) {
          set({ watchlist: [...watchlist, videoId] });
        }
      },
      
      removeFromWatchlist: (videoId: string) => {
        const { watchlist } = get();
        set({ watchlist: watchlist.filter(id => id !== videoId) });
      },
      
      setCurrentPage: (page: string) => set({ currentPage: page }),
      
      setCurrentVideo: (video: Video | null) => set({ currentVideo: video }),
      
      clearSearch: () => set({ 
        searchQuery: '', 
        searchResults: [], 
        isSearching: false 
      }),
    }),
    {
      name: 'glimz-app-storage',
      partialize: (state) => ({ 
        watchlist: state.watchlist,
        currentPage: state.currentPage 
      }),
    }
  )
);