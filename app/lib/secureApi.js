// Secure client-side API service that uses server-side routes
// This prevents API details from being visible in browser network tab

// Simple in-memory cache for user details to avoid repeated fetches
const userDetailsCache = {
  data: null,
  timestamp: 0,
  inflight: null,
};

export const secureApi = {
  // Send OTP
  async sendOTP(mobileNo, isCreator = 0) {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mobileNo,
          isCreator
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  },

  // Verify OTP
  async verifyOTP(mobileNo, otp) {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mobileNo,
          otp
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  // Resend OTP
  async resendOTP(mobileNo) {
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mobileNo
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  },

  // Create user account
  async createUser(userData) {
    try {
      const response = await fetch('/api/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Get user details (with 30s cache and in-flight guard)
  async getUserDetails({ force = false } = {}) {
    try {
      const now = Date.now();
      const isCacheValid = !force && userDetailsCache.data && (now - userDetailsCache.timestamp < 30000);
      if (isCacheValid) {
        return userDetailsCache.data;
      }

      if (userDetailsCache.inflight) {
        return await userDetailsCache.inflight;
      }

      userDetailsCache.inflight = (async () => {
        const response = await fetch('/api/user/details', {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        // Cache only if successful shape
        if (data && data.status) {
          userDetailsCache.data = data;
          userDetailsCache.timestamp = Date.now();
        }
        userDetailsCache.inflight = null;
        return data;
      })();

      return await userDetailsCache.inflight;
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Ensure inflight cleared on error
      userDetailsCache.inflight = null;
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      // Clear cache on logout
      userDetailsCache.data = null;
      userDetailsCache.timestamp = 0;
      userDetailsCache.inflight = null;
      return data;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  // Check if user is authenticated (client-side check)
  isAuthenticated() {
    // This will be handled by server-side middleware
    return true; // Placeholder - actual check done server-side
  }
};
