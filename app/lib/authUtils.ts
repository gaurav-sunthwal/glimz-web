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
  if (typeof document === "undefined") {
    return false;
  }

  // Check is_creator cookie (non-httpOnly, so we can read it)
  const isCreatorCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("is_creator="))
    ?.split("=")[1];

  return isCreatorCookie === "1";
}

/**
 * Check if the current user is authenticated
 * Checks for the presence of auth_token and uuid cookies
 * Note: If cookies are httpOnly, they cannot be read by JavaScript.
 * In that case, this function checks localStorage as a fallback.
 * @returns {boolean} True if user is authenticated (has both auth_token and uuid), false otherwise
 */
export function isAuthenticated(): boolean {
  // SSR / non-browser safety
  if (typeof document === "undefined") {
    return false;
  }

  // 1️⃣ Try cookies first (if they're not httpOnly)
  const authToken = getAuthToken();
  const uuid = getUserUuid();

  if (authToken && uuid) {
    // ✅ Auth via cookies
    return true;
  }

  // 2️⃣ Fallback: check localStorage (in case you stored auth there)
  let authTokenInStorage: string | null = null;
  let uuidInStorage: string | null = null;

  if (typeof window !== "undefined" && window.localStorage) {
    authTokenInStorage = localStorage.getItem("auth_token");
    uuidInStorage = localStorage.getItem("uuid");
  }

  if (authTokenInStorage && uuidInStorage) {
    // ✅ Auth via localStorage
    return true;
  }

  // 3️⃣ Nothing found → treat as not authenticated
  //    and clean up any stale client-side data
  clearAuthData();

  return false;
}

export function clearAuthData(): void {
  try {
    // Clear NON-httpOnly cookies (if any)
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "uuid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie =
      "is_creator=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";

    // Clear domain-specific cookie variants (optional safety)
    document.cookie = `auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
    document.cookie = `uuid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
    document.cookie = `is_creator=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;

    // Clear localStorage values
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("uuid");
      localStorage.removeItem("user");
    }

    // Notify other tabs/components that auth changed
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-changed"));
    }

    console.log("🧹 Auth data cleared");
  } catch (error) {
    console.error("❌ Failed to clear auth data:", error);
  }
}

/**
 * Get the user type from cookies
 * @returns {'creator' | 'user' | null} User type or null if not authenticated
 */
export function getUserType(): "creator" | "user" | null {
  if (typeof document === "undefined") {
    return null;
  }

  if (!isAuthenticated()) {
    return null;
  }

  const isCreatorCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("is_creator="))
    ?.split("=")[1];

  if (isCreatorCookie === "1") {
    return "creator";
  } else if (isCreatorCookie === "0") {
    return "user";
  }

  return null;
}

/**
 * Clear all authentication-related cookies
 * This function clears auth_token, uuid, and is_creator cookies
 */
export function clearAllCookies(): void {
  if (typeof document === "undefined") {
    return;
  }

  // List of cookies to clear
  const cookiesToClear = ["auth_token", "uuid", "is_creator"];

  cookiesToClear.forEach((cookieName) => {
    // Clear cookie by setting it to expire in the past
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // Also try with domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  });

  // Dispatch event to notify other components
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-changed"));
  }
}

/**
 * Get auth token from cookies
 * @returns {string | null} Auth token or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const authTokenCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
    ?.split("=")[1];

  return authTokenCookie || null;
}

/**
 * Get user UUID from cookies
 * @returns {string | null} User UUID or null if not found
 */
export function getUserUuid(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const uuidCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("uuid="))
    ?.split("=")[1];

  return uuidCookie || null;
}
