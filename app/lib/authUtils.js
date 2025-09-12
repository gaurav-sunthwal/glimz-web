// Authentication utility functions

/**
 * Check if user is currently authenticated
 * @returns {Promise<boolean>} True if user is authenticated, false otherwise
 */
export async function isUserAuthenticated() {
  try {
    // Make API call to verify authentication - this is the only reliable way
    const response = await fetch('/api/user/details', { 
      method: 'GET', 
      credentials: 'include' 
    });
    const data = await response.json();
    
    // User is only considered authenticated if they have valid user details
    // and is_creator is not null (meaning they've completed profile setup)
    return data && data.status && data.ViewerDetail && data.isCreator !== null;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Check if user needs to complete profile setup
 * @returns {Promise<boolean>} True if user needs profile setup, false otherwise
 */
export async function needsProfileSetup() {
  try {
    const response = await fetch('/api/user/details', { 
      method: 'GET', 
      credentials: 'include' 
    });
    const data = await response.json();
    
    // User needs profile setup if they have ViewerDetail but is_creator is null
    return data && data.status && data.ViewerDetail && data.isCreator === null;
  } catch (error) {
    console.error('Error checking profile setup:', error);
    return false;
  }
}

/**
 * Get the is_creator value from cookies
 * @returns {string|null} '0' for user, '1' for creator, null if not set
 */
export function getIsCreatorFromCookie() {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie
    .split(';')
    .map(c => c.trim())
    .reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
  
  return cookies['is_creator'] || null;
}

/**
 * Check if user is a creator based on cookie
 * @returns {boolean} True if user is a creator, false otherwise
 */
export function isUserCreator() {
  return getIsCreatorFromCookie() === '1';
}

/**
 * Check if user is a regular user based on cookie
 * @returns {boolean} True if user is a regular user, false otherwise
 */
export function isUserRegular() {
  return getIsCreatorFromCookie() === '0';
}

/**
 * Redirect authenticated users away from auth pages
 * @param {string} redirectPath - Path to redirect to (default: '/')
 */
export async function redirectIfAuthenticated(redirectPath = '/') {
  try {
    // Check if user has valid user details (fully authenticated)
    const response = await fetch('/api/user/details', { 
      method: 'GET', 
      credentials: 'include' 
    });
    const data = await response.json();
    
    if (data && data.status && data.ViewerDetail && data.isCreator !== null) {
      // User is fully authenticated with complete profile (is_creator is 0 or 1)
      window.location.href = redirectPath;
      return true; // Indicates redirect happened
    }
    
    if (data && data.status && data.ViewerDetail && data.isCreator === null) {
      // User has OTP verified but needs to complete profile setup (is_creator is null)
      window.location.href = '/signup/details';
      return true; // Indicates redirect happened
    }
    
    return false; // No redirect needed - user is not authenticated
  } catch (error) {
    console.error('Error checking authentication for redirect:', error);
    return false; // Don't redirect on error
  }
}
