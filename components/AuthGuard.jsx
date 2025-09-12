"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isUserAuthenticated } from '@/app/lib/authUtils';

const AuthGuard = ({ children, redirectTo = '/', requireAuth = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isUserAuthenticated();
      setIsAuthenticated(authStatus);
      setIsLoading(false);

      if (requireAuth && !authStatus) {
        // User needs to be authenticated but isn't
        console.log('User not authenticated, redirecting to login');
        router.push('/login');
      } else if (!requireAuth && authStatus) {
        // User is authenticated but shouldn't be on this page (e.g., login/signup)
        console.log('User already authenticated, redirecting to home');
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [requireAuth, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If requireAuth is true and user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If requireAuth is false and user is authenticated, don't render children (redirecting)
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return children;
};

export default AuthGuard;
