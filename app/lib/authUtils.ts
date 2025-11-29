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
 * Note: httpOnly cookies (auth_token, uuid) cannot be read by JavaScript,
 * so we use is_creator cookie as a proxy (it's set when user has verified OTP)
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  // Since auth_token and uuid are httpOnly, we can't read them directly
  // We use is_creator cookie as a proxy (it's set when user has verified OTP)
  // Note: For new users who just verified OTP but haven't created a profile,
  // is_creator might not be set yet, but they still have auth_token and uuid cookies
  // In that case, we can't detect auth via cookies alone - would need to check auth store
  const hasIsCreator = document.cookie.includes('is_creator=');
  
  return hasIsCreator;
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

