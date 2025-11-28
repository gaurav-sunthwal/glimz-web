import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserType = 'user' | 'creator' | null;

interface UserProfile {
  [key: string]: unknown;
}

interface AuthState {
  isAuthenticated: boolean;
  userType: UserType;
  userProfile: UserProfile | null;
  authToken: string | null;
  userUuid: string | null;
  authLoading: boolean;
  error: string | null;
  mobileNumber: string | null;
  
  // Actions
  setAuthentication: (
    isAuth: boolean,
    userType?: UserType,
    profile?: UserProfile,
    token?: string,
    uuid?: string
  ) => void;
  setAuthLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMobileNumber: (mobile: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      isAuthenticated: false,
      userType: null,
      userProfile: null,
      authToken: null,
      userUuid: null,
      authLoading: false,
      error: null,
      mobileNumber: null,

      setAuthentication: (isAuth, userType, profile, token, uuid) => {
        set({
          isAuthenticated: isAuth,
          userType: userType || null,
          userProfile: profile || null,
          authToken: token || null,
          userUuid: uuid || null,
          authLoading: false,
          error: null,
        });
      },

      setAuthLoading: (loading) => set({ authLoading: loading }),

      setError: (error) => set({ error }),

      setMobileNumber: (mobile) => set({ mobileNumber: mobile }),

      logout: () => {
        set({
          isAuthenticated: false,
          userType: null,
          userProfile: null,
          authToken: null,
          userUuid: null,
          authLoading: false,
          error: null,
          mobileNumber: null,
        });
      },
    }),
    {
      name: 'glimz-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userType: state.userType,
        userProfile: state.userProfile,
        authToken: state.authToken,
        userUuid: state.userUuid,
      }),
    }
  )
);

