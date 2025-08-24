import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
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
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setSearchResults: (results) => set({ searchResults: results }),
      
      setIsSearching: (isSearching) => set({ isSearching }),
      
      addToWatchlist: (videoId) => {
        const { watchlist } = get();
        if (!watchlist.includes(videoId)) {
          set({ watchlist: [...watchlist, videoId] });
        }
      },
      
      removeFromWatchlist: (videoId) => {
        const { watchlist } = get();
        set({ watchlist: watchlist.filter(id => id !== videoId) });
      },
      
      setCurrentPage: (page) => set({ currentPage: page }),
      
      setCurrentVideo: (video) => set({ currentVideo: video }),
      
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
