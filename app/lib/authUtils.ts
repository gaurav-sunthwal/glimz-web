/**
 * Authentication utility functions
 * Helper functions for checking auth status and managing cookies
 */

/**
 * Check if the current user is a creator
 * Reads the is_creator cookie to determine user type
 * Note: This function is client-side only and should be used in 'use client' components
 * @returns {boolean} True if user is a creator, false otherwise
 */
export function isUserCreator(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  // Check is_creator cookie (non-httpOnly, so we can read it)
  const isCreatorCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('is_creator='))
    ?.split('=')[1];

  return isCreatorCookie === '1';
}

/**
 * Check if the current user is authenticated
 * Checks for the presence of auth_token and uuid cookies
 * Note: If cookies are httpOnly, they cannot be read by JavaScript.
 * In that case, this function checks localStorage as a fallback.
 * @returns {boolean} True if user is authenticated (has both auth_token and uuid), false otherwise
 */
export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  // Try to read cookies first (works if they're not httpOnly)
  const authToken = getAuthToken();
  const uuid = getUserUuid();
  
  // If we can read both cookies, user is authenticated
  if (authToken && uuid) {
    return true;
  }
  
  // If cookies are httpOnly (can't read them), check localStorage as fallback
  if (typeof window !== 'undefined' && window.localStorage) {
    const authTokenInStorage = localStorage.getItem('auth_token');
    const uuidInStorage = localStorage.getItem('uuid');
    
    // User is authenticated if both exist in localStorage
    if (authTokenInStorage && uuidInStorage) {
      return true;
    }
  }
  
  // If we can't find both auth_token and uuid in cookies or localStorage, user is not authenticated
  return false;
}

/**
 * Get the user type from cookies
 * @returns {'creator' | 'user' | null} User type or null if not authenticated
 */
export function getUserType(): 'creator' | 'user' | null {
  if (typeof document === 'undefined') {
    return null;
  }

  if (!isAuthenticated()) {
    return null;
  }

  const isCreatorCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('is_creator='))
    ?.split('=')[1];

  if (isCreatorCookie === '1') {
    return 'creator';
  } else if (isCreatorCookie === '0') {
    return 'user';
  }

  return null;
}

/**
 * Clear all authentication-related cookies
 * This function clears auth_token, uuid, and is_creator cookies
 */
export function clearAllCookies(): void {
  if (typeof document === 'undefined') {
    return;
  }

  // List of cookies to clear
  const cookiesToClear = ['auth_token', 'uuid', 'is_creator'];

  cookiesToClear.forEach((cookieName) => {
    // Clear cookie by setting it to expire in the past
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // Also try with domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  });

  // Dispatch event to notify other components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-changed'));
  }
}

/**
 * Get auth token from cookies
 * @returns {string | null} Auth token or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const authTokenCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('auth_token='))
    ?.split('=')[1];

  return authTokenCookie || null;
}

/**
 * Get user UUID from cookies
 * @returns {string | null} User UUID or null if not found
 */
export function getUserUuid(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const uuidCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('uuid='))
    ?.split('=')[1];

  return uuidCookie || null;
}

/**
 * Check if is_creator cookie exists
 * @returns {boolean} True if is_creator cookie exists (regardless of value), false otherwise
 */
export function hasIsCreatorCookie(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const isCreatorCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('is_creator='));

  return isCreatorCookie !== undefined;
}

