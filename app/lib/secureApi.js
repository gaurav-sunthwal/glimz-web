// Secure client wrapper that talks to our Next.js API routes

const userDetailsCache = { data: null, timestamp: 0, inflight: null };

export const secureApi = {

  async getUserDetails({ force = false } = {}) {
    const now = Date.now();
    const isCacheValid = !force && userDetailsCache.data && now - userDetailsCache.timestamp < 30000;
    if (isCacheValid) return userDetailsCache.data;
    if (userDetailsCache.inflight) return await userDetailsCache.inflight;

    userDetailsCache.inflight = (async () => {
      try {
        const resp = await fetch('/api/user/details', { method: 'GET', credentials: 'include' });
        const data = await resp.json();
        
        // Check if response indicates authentication error (401 Unauthorized or status: false)
        const isAuthError = (!resp.ok && resp.status === 401) || !data || !data.status;
        
        if (isAuthError) {
          // Handle auth error
        } else if (data && data.status) {
          userDetailsCache.data = data;
          userDetailsCache.timestamp = Date.now();
        }
        
        userDetailsCache.inflight = null;
        return data;
      } catch (error) {
        userDetailsCache.inflight = null;
        return { status: false, error: error.message };
      }
    })();

    return await userDetailsCache.inflight;
  },

  async getUserDetailsByType({ force = false } = {}) {
    const now = Date.now();
    const isCacheValid = !force && userDetailsCache.data && now - userDetailsCache.timestamp < 30000;
    if (isCacheValid) return userDetailsCache.data;
    if (userDetailsCache.inflight) return await userDetailsCache.inflight;

    userDetailsCache.inflight = (async () => {
      try {
        // Check is_creator cookie to determine which endpoint to call
        const isCreatorCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('is_creator='))
          ?.split('=')[1];
        
        let endpoint;
        if (isCreatorCookie === '1') {
          endpoint = '/api/auth/get-creator-detail';
        } else if (isCreatorCookie === '0') {
          endpoint = '/api/auth/get-viewer-detail';
        } else {
          // Fallback to original endpoint
          endpoint = '/api/user/details';
        }

        const resp = await fetch(endpoint, { method: 'GET', credentials: 'include' });
        const data = await resp.json();
        
        // Check if response indicates authentication error (401 Unauthorized or status: false)
        const isAuthError = (!resp.ok && resp.status === 401) || !data || !data.status;
        
        if (isAuthError) {
          // Handle auth error
        } else if (data && data.status) {
          userDetailsCache.data = data;
          userDetailsCache.timestamp = Date.now();
        }
        
        userDetailsCache.inflight = null;
        return data;
      } catch (error) {
        userDetailsCache.inflight = null;
        return { status: false, error: error.message };
      }
    })();

    return await userDetailsCache.inflight;
  },


  async search({ query, type = "all", page = 1, limit = 10 }) {
    if (!query || !query.trim()) {
      return {
        status: false,
        code: 400,
        message: "Search query is required",
        error: "Missing required parameter: q",
      };
    }

    const queryParams = new URLSearchParams({
      q: query.trim(),
      type: type,
      page: page.toString(),
      limit: limit.toString(),
    });

    const resp = await fetch(`/api/search?${queryParams.toString()}`, {
      method: "GET",
      credentials: "include",
    });
    return await resp.json();
  },

  async logout() {
    try {
      const resp = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear cache
      userDetailsCache.data = null;
      userDetailsCache.timestamp = 0;
      
      // Clear all cookies on client side (with all possible paths)
      if (typeof document !== 'undefined') {
        const cookieNames = ['auth_token', 'uuid', 'is_creator'];
        const paths = ['/', '/auth', '/profile', '/upload', ''];
        
        cookieNames.forEach(cookieName => {
          // Clear with different paths
          paths.forEach(path => {
            const pathAttr = path ? `path=${path};` : '';
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${pathAttr}`;
          });
          
          // Try clearing with domain (if applicable)
          try {
            const hostname = window.location.hostname;
            // Try with current domain
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
            // Try with dot-prefixed domain (for subdomains)
            if (hostname.indexOf('.') !== -1) {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
            }
          } catch {
            // Ignore domain errors
          }
        });
      }
      
      // Clear localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('uuid');
        localStorage.removeItem('userData');
        // Clear any other auth-related items
        Object.keys(localStorage).forEach(key => {
          if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token') || key.toLowerCase().includes('uuid')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Clear sessionStorage as well
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('uuid');
        sessionStorage.removeItem('userData');
        // Clear any other auth-related items
        Object.keys(sessionStorage).forEach(key => {
          if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token') || key.toLowerCase().includes('uuid')) {
            sessionStorage.removeItem(key);
          }
        });
      }
      
      // Dispatch auth changed event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'));
      }
      
      return await resp.json();
    } catch (error) {
      // Clear everything even on error
      if (typeof document !== 'undefined') {
        const cookieNames = ['auth_token', 'uuid', 'is_creator'];
        const paths = ['/', '/auth', '/profile', '/upload', ''];
        
        cookieNames.forEach(cookieName => {
          // Clear with different paths
          paths.forEach(path => {
            const pathAttr = path ? `path=${path};` : '';
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${pathAttr}`;
          });
          
          // Try clearing with domain (if applicable)
          try {
            const hostname = window.location.hostname;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
            if (hostname.indexOf('.') !== -1) {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
            }
          } catch {
            // Ignore domain errors
          }
        });
      }
      
      if (typeof window !== 'undefined') {
        if (window.localStorage) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('uuid');
          localStorage.removeItem('userData');
          Object.keys(localStorage).forEach(key => {
            if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token') || key.toLowerCase().includes('uuid')) {
              localStorage.removeItem(key);
            }
          });
        }
        
        if (window.sessionStorage) {
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('uuid');
          sessionStorage.removeItem('userData');
          Object.keys(sessionStorage).forEach(key => {
            if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token') || key.toLowerCase().includes('uuid')) {
              sessionStorage.removeItem(key);
            }
          });
        }
        
        window.dispatchEvent(new Event('auth-changed'));
      }
      
      userDetailsCache.data = null;
      userDetailsCache.timestamp = 0;
      
      return { status: false, error: error.message };
    }
  },

  isAuthenticated() {
    return true;
  }
};


